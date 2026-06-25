-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AGENT', 'CHEF');

-- CreateEnum
CREATE TYPE "Habilitation" AS ENUM ('CONFIDENTIEL', 'SECRET', 'TRES_SECRET');

-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('DISPONIBLE', 'EN_COURS', 'REUSSIE', 'ECHOUEE');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cover_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "habilitation" "Habilitation" NOT NULL DEFAULT 'CONFIDENTIEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "niveau_confidentialite" "Habilitation" NOT NULL DEFAULT 'CONFIDENTIEL',
    "statut" "Statut" NOT NULL DEFAULT 'DISPONIBLE',
    "recompense" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Mission_titre_key" ON "Mission"("titre");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
