-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('REQUEST', 'LIVE');

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'sparkles',
    "durationMinutes" INTEGER NOT NULL DEFAULT 50,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "expertise" TEXT[],
    "imageId" TEXT,
    "workingHours" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalService" (
    "professionalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ProfessionalService_pkey" PRIMARY KEY ("professionalId","serviceId")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "mode" "BookingMode" NOT NULL DEFAULT 'REQUEST',
    "serviceId" TEXT,
    "serviceName" TEXT NOT NULL,
    "professionalId" TEXT,
    "professionalName" TEXT,
    "preferredDate" DATE NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "slotStart" TIMESTAMP(3),
    "slotEnd" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "statusUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'PT',
    "mapsUrl" TEXT,
    "mapsEmbedUrl" TEXT,
    "openingHours" JSONB NOT NULL,
    "socials" JSONB NOT NULL,
    "bookingMode" "BookingMode" NOT NULL DEFAULT 'REQUEST',
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "aboutIntro" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_enabled_sortOrder_idx" ON "Service"("enabled", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_slug_key" ON "Professional"("slug");

-- CreateIndex
CREATE INDEX "Professional_enabled_sortOrder_idx" ON "Professional"("enabled", "sortOrder");

-- CreateIndex
CREATE INDEX "ProfessionalService_serviceId_idx" ON "ProfessionalService"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_reference_key" ON "Appointment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_idempotencyKey_key" ON "Appointment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Appointment_status_createdAt_idx" ON "Appointment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Appointment_preferredDate_idx" ON "Appointment"("preferredDate");

-- CreateIndex
CREATE INDEX "Appointment_phone_createdAt_idx" ON "Appointment"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "Appointment_professionalId_slotStart_idx" ON "Appointment"("professionalId", "slotStart");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalService" ADD CONSTRAINT "ProfessionalService_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalService" ADD CONSTRAINT "ProfessionalService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
