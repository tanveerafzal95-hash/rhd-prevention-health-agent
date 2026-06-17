# RHD Prevention Health Agent

An educational, culturally respectful, guideline-based medical assistant web application for acute rheumatic fever (ARF) and rheumatic heart disease (RHD) prevention in remote Australian communities.

## Purpose & Target Population
The app provides simple, clinical, trustworthy, and guideline-based education for community health workers, Aboriginal health practitioners, parents, and families who care for children (with a critical focus on Aboriginal and Torres Strait Islander children aged 5-14 years in remote Australia, who experience some of the highest recorded rates of ARF and RHD globally).

## Golden Source of Truth
This resource leverages **The Australian guideline for prevention, diagnosis and management of acute rheumatic fever and rheumatic heart disease** published by **RHD Australia** as its core reference.

## Key Safety Rules (Strict Compliance)
- **Do No Diagnose:** The agent will not attempt to diagnose active sore throats, skin sores, or fever symptoms.
- **Do Not Prescribe:** No pharmaceutical dosing schedules or drug administrations are recommended.
- **Support Clinicians:** It is explicitly designed as a support tool; it does not replace the face-to-face service of certified Doctors, Nurses, or Aboriginal Health Practitioners.
- **Severe Concerns:** Prominent red-flag emergency callouts advise contacting **000** or immediate clinical consultation if chest pain, severe faints, or shallow breathing is reported.
- **Out of Scope Safeguard:** If questions are unsupported by standard Australian RHD Australia guidelines, the system politely declines to answer to prevent unsafe medical suggestions.

## Technical Details
- **Frontend Framework:** React 19, Vite, and Tailwind CSS.
- **Production Server:** Full-stack Express with Node.js to hide credentials in a secure proxy backend.
- **AI Model Integration:** Gemini 3.5 Flash utilizing developer/health practitioner mode rulesets.
