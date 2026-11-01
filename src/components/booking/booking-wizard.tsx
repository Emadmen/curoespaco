"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Loader2,
  Lock,
  Pencil,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format as fmt, t } from "@/content";
import { getRequestTimeOptions, isRequestableDate } from "@/lib/availability";
import { formatDateLong, nowMinutesInClinic, parseDateOnly, toDateOnly, todayInClinic } from "@/lib/dates";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validations";
import { buildWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";
import { uuid } from "@/lib/uuid";
import type { BookingModeValue, OpeningHoursEntry } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ServiceIcon } from "@/components/services/service-icon";
import { Calendar } from "@/components/booking/calendar";

export type WizardService = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  durationMinutes: number;
  professionalIds: string[];
};

export type WizardProfessional = {
  id: string;
  slug: string;
  name: string;
  title: string;
  imageUrl?: string | null;
  serviceIds: string[];
};

type Props = {
  services: WizardService[];
  professionals: WizardProfessional[];
  whatsapp: string;
  openingHours: OpeningHoursEntry[];
  bookingMode: BookingModeValue;
  horizonDays: number;
  initialServiceId?: string | null;
  initialProfessionalId?: string | null;
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string }
  | { kind: "error"; message: string };

const STEP_KEYS = ["service", "professional", "datetime", "details"] as const;
type StepIndex = 0 | 1 | 2 | 3;

const FIELDS_BY_STEP: Record<StepIndex, (keyof BookingFormValues)[]> = {
  0: ["serviceId"],
  1: ["professionalId"],
  2: ["preferredDate", "preferredTime"],
  3: ["name", "phone", "email", "consent"],
};

export function BookingWizard({
  services,
  professionals,
  whatsapp,
  openingHours,
  bookingMode,
  horizonDays,
  initialServiceId,
  initialProfessionalId,
}: Props) {
  const reduceMotion = useReducedMotion();
  const idempotencyKey = useRef<string>("");
  const startedAt = useRef<number>(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const inFlight = useRef(false);

  const validInitialService = services.find((s) => s.id === initialServiceId) ?? null;
  const validInitialProfessional =
    professionals.find(
      (p) => p.id === initialProfessionalId && (!validInitialService || p.serviceIds.includes(validInitialService.id)),
    ) ?? null;

  const [step, setStep] = useState<StepIndex>(
    validInitialService ? (validInitialProfessional ? 2 : 1) : 0,
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [clock, setClock] = useState<{ today: string; minutes: number } | null>(null);
  const [liveSlots, setLiveSlots] = useState<{ key: string; slots: string[] } | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    // Validate on submit/continue (not on blur): blur-time errors shift the layout on
    // phones, which can move the submit button away from under the user's finger.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      serviceId: validInitialService?.id ?? "",
      professionalId: validInitialProfessional?.id ?? "",
      preferredDate: "",
      preferredTime: "",
      name: "",
      phone: "",
      email: "",
      consent: false,
      website: "",
    },
  });
  const { register, setValue, trigger, handleSubmit, setError, formState, control } = form;
  const values = useWatch({ control }) as BookingFormValues;

  // Client-only values (avoid hydration mismatches): clock in clinic time zone, idempotency key, start time.
  useEffect(() => {
    idempotencyKey.current = uuid();
    startedAt.current = Date.now();
    const tick = () => setClock({ today: todayInClinic(), minutes: nowMinutesInClinic() });
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Move focus to the step heading for screen-reader and keyboard users (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const top = rootRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) rootRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [step, status.kind, reduceMotion]);

  const service = services.find((s) => s.id === values.serviceId) ?? null;
  const professional = professionals.find((p) => p.id === values.professionalId) ?? null;
  const lockedProfessional = step === 0 && professional ? professional : null;
  const visibleServices = lockedProfessional
    ? services.filter((s) => lockedProfessional.serviceIds.includes(s.id))
    : services;
  const availableProfessionals = service ? professionals.filter((p) => p.serviceIds.includes(service.id)) : [];

  const maxDate = clock ? toDateOnly(addDays(parseDateOnly(clock.today), horizonDays)) : "";
  const isDateDisabled = useCallback(
    (date: string) => !clock || !isRequestableDate(openingHours, date, clock.today, horizonDays),
    [clock, openingHours, horizonDays],
  );

  // LIVE mode: fetch real slots for the selected date. Results are keyed by the
  // query, so "loading" is simply "no result for the current key yet".
  const liveKey =
    bookingMode === "LIVE" && values.preferredDate && values.serviceId
      ? `${values.serviceId}|${values.professionalId}|${values.preferredDate}`
      : null;
  const liveLoading = liveKey !== null && liveSlots?.key !== liveKey;
  useEffect(() => {
    if (!liveKey) return;
    const [serviceId, professionalId, date] = liveKey.split("|");
    const controller = new AbortController();
    const qs = new URLSearchParams({ serviceId, date });
    if (professionalId) qs.set("professionalId", professionalId);
    fetch(`/api/availability?${qs}`, { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json() as Promise<{ slots: string[] }>)
      .then((data) => setLiveSlots({ key: liveKey, slots: data.slots ?? [] }))
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setLiveSlots({ key: liveKey, slots: [] });
      });
    return () => controller.abort();
  }, [liveKey]);

  const timeOptions = useMemo(() => {
    if (!values.preferredDate || !clock) return [];
    if (bookingMode === "LIVE") return liveSlots && liveSlots.key === liveKey ? liveSlots.slots : [];
    return getRequestTimeOptions(openingHours, values.preferredDate, clock);
  }, [bookingMode, clock, liveKey, liveSlots, openingHours, values.preferredDate]);

  const whatsappBookingUrl = buildWhatsAppUrl(
    whatsapp,
    service
      ? whatsappMessages.booking({
          service: service.name,
          therapist: professional?.name,
          date: values.preferredDate || null,
          time: values.preferredTime || null,
        })
      : whatsappMessages.general(),
  );

  async function goNext() {
    const ok = await trigger(FIELDS_BY_STEP[step]);
    if (ok && step < 3) setStep((step + 1) as StepIndex);
  }

  function chooseService(id: string) {
    setValue("serviceId", id, { shouldValidate: true });
    const current = professionals.find((p) => p.id === values.professionalId);
    if (current && !current.serviceIds.includes(id)) setValue("professionalId", "");
    setValue("preferredTime", "");
    setStep(current && current.serviceIds.includes(id) ? 2 : 1);
  }

  function chooseProfessional(id: string) {
    setValue("professionalId", id, { shouldValidate: true });
    if (bookingMode === "LIVE") setValue("preferredTime", "");
    setStep(2);
  }

  function chooseDate(date: string) {
    setValue("preferredDate", date, { shouldValidate: true });
    const stillValid =
      bookingMode === "REQUEST" && clock && getRequestTimeOptions(openingHours, date, clock).includes(values.preferredTime);
    if (!stillValid) setValue("preferredTime", "");
  }

  async function submitRequest(data: BookingFormValues) {
    // Guard against double clicks; the server is idempotent as well (same idempotencyKey).
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          serviceId: data.serviceId,
          professionalId: data.professionalId || null,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          name: data.name,
          phone: data.phone,
          email: data.email,
          consent: data.consent,
          website: data.website,
          idempotencyKey: idempotencyKey.current,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok: true; reference: string }
        | { ok: false; code: string; fieldErrors?: Record<string, string[]> }
        | null;

      // Only a positive, explicit confirmation from the server counts as success.
      if (res.ok && body?.ok === true && body.reference) {
        setStatus({ kind: "success", reference: body.reference });
        return;
      }

      const code = body && !body.ok ? body.code : "SERVER_ERROR";
      if (code === "VALIDATION" && body && !body.ok && body.fieldErrors) {
        for (const [field, messages] of Object.entries(body.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof BookingFormValues, { message: messages[0] });
        }
        const firstStep = ([0, 1, 2, 3] as StepIndex[]).find((s) =>
          FIELDS_BY_STEP[s].some((f) => body.fieldErrors?.[f]?.length),
        );
        if (firstStep !== undefined) setStep(firstStep);
        setStatus({ kind: "error", message: t.booking.errorValidation });
        return;
      }
      if (code === "SLOT_UNAVAILABLE" || code === "INVALID_TIME" || code === "INVALID_DATE") {
        setValue("preferredTime", "");
        setStep(2);
        setStatus({ kind: "error", message: t.booking.errorSlotTaken });
        return;
      }
      if (code === "INVALID_SERVICE" || code === "INVALID_PROFESSIONAL") {
        setStep(code === "INVALID_SERVICE" ? 0 : 1);
        setStatus({ kind: "error", message: t.booking.errorGeneric });
        return;
      }
      if (res.status === 429 || code === "RATE_LIMITED" || code === "TOO_MANY_REQUESTS") {
        setStatus({ kind: "error", message: t.booking.errorRateLimit });
        return;
      }
      setStatus({ kind: "error", message: t.booking.errorGeneric });
    } catch {
      setStatus({ kind: "error", message: t.booking.errorNetwork });
    } finally {
      inFlight.current = false;
    }
  }

  function startOver() {
    form.reset();
    idempotencyKey.current = uuid();
    startedAt.current = Date.now();
    setStatus({ kind: "idle" });
    setStep(0);
  }

  // ─── Success ───────────────────────────────────────────────────────────────
  if (status.kind === "success") {
    return (
      <div ref={rootRef} className="scroll-mt-28">
        <SuccessScreen
          headingRef={headingRef}
          reference={status.reference}
          serviceName={service?.name ?? ""}
          professionalName={professional?.name ?? t.booking.noPreference}
          date={values.preferredDate}
          time={values.preferredTime}
          whatsappUrl={whatsappBookingUrl}
          onStartOver={startOver}
        />
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const errors = formState.errors;
  const stepTitle = [t.booking.serviceTitle, t.booking.professionalTitle, t.booking.datetimeTitle, t.booking.detailsTitle][step];

  return (
    <div ref={rootRef} className="scroll-mt-28" data-testid="booking-wizard" data-step={step}>
      <StepIndicator step={step} onGoTo={(s) => s < step && setStep(s)} />

      <form onSubmit={(event) => handleSubmit(submitRequest)(event)} noValidate className="mt-6" aria-describedby="booking-step-count">
        {/* Honeypot: hidden from people, tempting for bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        <p id="booking-step-count" className="eyebrow">
          {fmt(t.booking.stepOf, { current: step + 1, total: 4 })}
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 type-display-md outline-none"
        >
          {stepTitle}
        </h2>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-6"
          >
            {/* Step 1 — Service */}
            {step === 0 && (
              <fieldset>
                <legend className="sr-only">{t.booking.serviceTitle}</legend>
                {lockedProfessional ? (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sage-100 px-4 py-3 text-sm text-foreground">
                    <span>
                      <UserRound className="mr-1.5 inline size-4" aria-hidden="true" />
                      {lockedProfessional.name}
                    </span>
                    <button
                      type="button"
                      className="font-semibold underline underline-offset-4"
                      onClick={() => setValue("professionalId", "")}
                    >
                      {t.cta.seeAllServices}
                    </button>
                  </div>
                ) : (
                  <p className="mb-4 text-muted-foreground">{t.booking.serviceHint}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleServices.map((s) => (
                    <ChoiceCard
                      key={s.id}
                      name="serviceId"
                      value={s.id}
                      checked={values.serviceId === s.id}
                      onSelect={() => chooseService(s.id)}
                      title={s.name}
                      description={s.shortDescription}
                      icon={<ServiceIcon name={s.icon} className="size-6" />}
                    />
                  ))}
                </div>
                <FieldError message={errors.serviceId?.message} />
              </fieldset>
            )}

            {/* Step 2 — Professional (optional) */}
            {step === 1 && (
              <fieldset>
                <legend className="sr-only">{t.booking.professionalTitle}</legend>
                <p className="mb-4 text-muted-foreground">{t.booking.professionalHint}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceCard
                    name="professionalId"
                    value=""
                    checked={values.professionalId === ""}
                    onSelect={() => chooseProfessional("")}
                    title={t.booking.noPreference}
                    description={t.booking.noPreferenceText}
                    icon={<Check className="size-6" />}
                  />
                  {availableProfessionals.map((p) => (
                    <ChoiceCard
                      key={p.id}
                      name="professionalId"
                      value={p.id}
                      checked={values.professionalId === p.id}
                      onSelect={() => chooseProfessional(p.id)}
                      title={p.name}
                      description={p.title}
                      icon={
                        p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt="" className="size-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg">{initials(p.name)}</span>
                        )
                      }
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {/* Step 3 — Date & time */}
            {step === 2 && (
              <fieldset>
                <legend className="sr-only">{t.booking.datetimeTitle}</legend>
                <p className="mb-5 flex gap-2.5 rounded-xl bg-sand-100 px-4 py-3 text-[0.9375rem] leading-snug text-foreground border border-border">
                  <Info className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
                  {bookingMode === "LIVE" ? t.booking.liveModeNotice : t.booking.requestModeNotice}
                </p>
                <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                  <div>
                    <p className="mb-2 font-semibold text-foreground" id="date-label">
                      {t.booking.chooseDate}
                    </p>
                    {clock ? (
                      <Calendar
                        value={values.preferredDate}
                        onChange={chooseDate}
                        today={clock.today}
                        maxDate={maxDate}
                        isDisabled={isDateDisabled}
                      />
                    ) : (
                      <div className="h-80 animate-pulse rounded-xl bg-sage-100" />
                    )}
                    <FieldError message={errors.preferredDate?.message} />
                  </div>
                  <div>
                    <p className="mb-2 font-semibold text-foreground" id="time-label">
                      {bookingMode === "LIVE" ? t.booking.chooseTimeLive : t.booking.chooseTime}
                    </p>
                    {!values.preferredDate ? (
                      <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
                        {t.booking.chooseDate}
                      </p>
                    ) : liveLoading ? (
                      <p className="flex items-center gap-2 p-4 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        {t.booking.loadingTimes}
                      </p>
                    ) : timeOptions.length === 0 ? (
                      <p className="rounded-xl bg-sand-100 p-6 text-center text-muted-foreground">{t.booking.noTimes}</p>
                    ) : (
                      <TimeChips
                        options={timeOptions}
                        value={values.preferredTime}
                        onChange={(time) => setValue("preferredTime", time, { shouldValidate: true })}
                        dateLabel={formatDateLong(values.preferredDate)}
                      />
                    )}
                    <FieldError message={errors.preferredTime?.message} />
                  </div>
                </div>
              </fieldset>
            )}

            {/* Step 4 — Contact details */}
            {step === 3 && (
              <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-5">
                  <p className="text-muted-foreground">{t.booking.detailsHint}</p>
                  <Field id="name" label={t.booking.name} error={errors.name?.message}>
                    <Input
                      id="name"
                      autoComplete="name"
                      placeholder={t.booking.namePlaceholder}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      {...register("name")}
                    />
                  </Field>
                  <Field id="phone" label={t.booking.phone} error={errors.phone?.message}>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={t.booking.phonePlaceholder}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      {...register("phone")}
                    />
                  </Field>
                  <Field
                    id="email"
                    label={t.booking.email}
                    hint={t.booking.emailOptional}
                    error={errors.email?.message}
                  >
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder={t.booking.emailPlaceholder}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      {...register("email")}
                    />
                  </Field>
                  <div>
                    <div className="flex items-start gap-3 surface p-4">
                      <input
                        id="consent"
                        type="checkbox"
                        aria-invalid={!!errors.consent}
                        aria-describedby={errors.consent ? "consent-error" : undefined}
                        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-primary"
                        {...register("consent")}
                      />
                      <Label htmlFor="consent" className="block text-sm leading-relaxed font-normal text-foreground">
                        {t.booking.consent}{" "}
                        <Link href="/politica-de-privacidade" target="_blank" className="font-semibold underline underline-offset-4">
                          {t.booking.consentLink}
                        </Link>
                        .
                      </Label>
                    </div>
                    <FieldError id="consent-error" message={errors.consent?.message} />
                  </div>
                  <p className="flex gap-2 text-sm text-muted-foreground">
                    <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {t.booking.sensitiveNotice}
                  </p>
                </div>
                <Summary
                  serviceName={service?.name ?? ""}
                  professionalName={professional?.name ?? t.booking.noPreference}
                  date={values.preferredDate}
                  time={values.preferredTime}
                  onEdit={(s) => setStep(s)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {status.kind === "error" && (
          <div role="alert" className="mt-6 rounded-xl bg-danger-100 p-4 text-[0.9375rem] text-destructive sm:p-5">
            <p className="flex items-center gap-2 font-semibold">
              <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
              {t.booking.errorTitle}
            </p>
            <p className="mt-1.5 leading-relaxed">{status.message}</p>
            <a
              href={whatsappBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-3")}
            >
              <WhatsAppIcon className="size-4" />
              {t.booking.whatsappFallback}
            </a>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="ghost" size="lg" onClick={() => setStep((step - 1) as StepIndex)}>
              <ArrowLeft aria-hidden="true" />
              {t.booking.back}
            </Button>
          ) : (
            <span />
          )}
          {step === 1 && (
            <Button type="button" size="lg" onClick={() => setStep(2)}>
              {values.professionalId ? t.booking.next : t.booking.skip}
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
          {(step === 0 || step === 2) && (
            <Button type="button" size="lg" onClick={goNext} disabled={step === 0 && !values.serviceId}>
              {t.booking.next}
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
          {step === 3 && (
            <Button type="submit" size="xl" disabled={submitting} aria-busy={submitting} data-testid="submit-booking">
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t.booking.submitting}
                </>
              ) : (
                <>
                  <Check aria-hidden="true" />
                  {t.booking.submit}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

function StepIndicator({ step, onGoTo }: { step: StepIndex; onGoTo: (s: StepIndex) => void }) {
  return (
    <nav aria-label="Progresso da marcação">
      <ol className="grid grid-cols-4 gap-2">
        {STEP_KEYS.map((key, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onGoTo(i as StepIndex)}
                disabled={!done}
                aria-current={current ? "step" : undefined}
                className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "h-0.5 transition-colors duration-500",
                    done || current ? "bg-primary" : "bg-foreground/15",
                  )}
                />
                <span
                  className={cn(
                    "hidden text-xs font-semibold sm:block",
                    current ? "text-foreground" : done ? "text-foreground/70 group-hover:underline" : "text-foreground/60",
                  )}
                >
                  {t.booking.steps[key]}
                </span>
                <span className="sr-only sm:hidden">{t.booking.steps[key]}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
  icon,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "group relative flex min-h-20 cursor-pointer items-center gap-3 rounded-xl bg-card p-3.5 ring-1 transition-colors sm:gap-4 sm:p-4",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
        checked ? "ring-2 ring-primary" : "ring-input hover:ring-primary",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        onClick={() => checked && onSelect()}
        className="sr-only"
      />
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center overflow-hidden rounded-full transition-colors sm:size-12",
          checked ? "bg-primary text-primary-foreground" : "bg-sage-100 text-foreground group-hover:bg-sage-200",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-foreground">{title}</span>
        {description && <span className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground">{description}</span>}
      </span>
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-all",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
        aria-hidden="true"
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </label>
  );
}

function TimeChips({
  options,
  value,
  onChange,
  dateLabel,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  dateLabel: string;
}) {
  const groups = [
    { label: t.booking.morning, items: options.filter((o) => o < "13:00") },
    { label: t.booking.afternoon, items: options.filter((o) => o >= "13:00") },
  ].filter((g) => g.items.length);
  return (
    <div className="space-y-4 surface p-4 sm:p-5">
      <p className="text-sm text-muted-foreground first-letter:uppercase">{dateLabel}</p>
      {groups.map((g) => (
        <div key={g.label} role="radiogroup" aria-label={`${g.label} — ${dateLabel}`}>
          <p className="mb-2 label-caps">{g.label}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {g.items.map((time) => {
              const selected = value === time;
              return (
                <button
                  key={time}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(time)}
                  className={cn(
                    "h-12 rounded-lg text-[0.9375rem] font-medium tabular-nums ring-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-card text-foreground ring-input hover:bg-sage-100",
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 text-[0.9375rem] font-semibold text-foreground">
        {label} {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-destructive" role="alert">
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function Summary({
  serviceName,
  professionalName,
  date,
  time,
  onEdit,
}: {
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  onEdit?: (step: StepIndex) => void;
}) {
  const rows: { label: string; value: string; step: StepIndex }[] = [
    { label: t.booking.steps.service, value: serviceName, step: 0 },
    { label: t.booking.steps.professional, value: professionalName, step: 1 },
    { label: t.booking.steps.datetime, value: date ? `${formatDateLong(date)} · ${time}` : "—", step: 2 },
  ];
  return (
    <aside className="h-fit rounded-xl bg-sage-100 p-5 sm:p-6" aria-label={t.booking.summary}>
      <h3 className="label-caps">{t.booking.summary}</h3>
      <dl className="mt-4 space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <dt className="label-caps">{r.label}</dt>
              <dd className="mt-0.5 font-medium text-foreground first-letter:uppercase">{r.value}</dd>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(r.step)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-foreground hover:bg-card"
                aria-label={`${t.booking.edit}: ${r.label}`}
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                {t.booking.edit}
              </button>
            )}
          </div>
        ))}
      </dl>
    </aside>
  );
}

function SuccessScreen({
  headingRef,
  reference,
  serviceName,
  professionalName,
  date,
  time,
  whatsappUrl,
  onStartOver,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  reference: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  whatsappUrl: string;
  onStartOver: () => void;
}) {
  return (
    <div className="text-center" data-testid="booking-success">
      <div className="relative mx-auto grid size-24 place-items-center">
                <span className="relative grid size-24 place-items-center rounded-full bg-sage-300">
          <Check className="size-11 text-foreground" strokeWidth={2.5} aria-hidden="true" />
        </span>
      </div>
      <h2 ref={headingRef} tabIndex={-1} className="mt-8 type-display-lg outline-none">
        {t.booking.successTitle}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">{t.booking.successText}</p>
      <p className="mt-6 inline-flex flex-col items-center rounded-xl bg-sage-100 px-6 py-3">
        <span className="label-caps">{t.booking.successReference}</span>
        <span className="type-display-sm tracking-wider" data-testid="booking-reference">
          {reference}
        </span>
      </p>
      <div className="mx-auto mt-8 max-w-md text-left">
        <Summary serviceName={serviceName} professionalName={professionalName} date={date} time={time} />
      </div>
      <p className="mx-auto mt-6 flex max-w-md gap-2 text-left text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t.booking.successNote}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "default", size: "lg" })}
          data-testid="success-whatsapp"
        >
          <WhatsAppIcon className="size-5" />
          {t.booking.successWhatsapp}
        </a>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          {t.booking.successHome}
        </Link>
      </div>
      <button type="button" onClick={onStartOver} className="mt-5 text-sm font-semibold text-foreground underline underline-offset-4">
        {t.booking.newRequest}
      </button>
    </div>
  );
}
