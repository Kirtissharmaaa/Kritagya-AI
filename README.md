# Kritagya AI 🏙️
### Decentralized Consensus-Based Smart City Infrastructure Tracking & Truth Verification Protocol

**Developed for the Vibe2Ship Hackathon 2026**  
*Presented by Coding Ninjas (10X Club) × Google for Developers*

---

## 🚀 Live Links & Project Assets
- **Live Interactive Prototype (Google AI Studio Build):** https://kritagya-ai-356505664229.asia-southeast1.run.app
- **Project Documentation (Google Doc Link):** https://docs.google.com/document/d/1pkmyJK1FJ0GeywqjDWddKCdmtYQBengzWUDgVimhqOI/edit?usp=sharing

---

## 🛠️ Vibe2Ship Prototype Architecture Notice
> **Important Note for Evaluators:** In alignment with the rapid-prototyping ("vibe coding") principles of the **Vibe2Ship Hackathon**, Kritagya AI is deployed as a high-fidelity architectural prototype. 
> 
> To ensure immediate testing and absolute data privacy during jury evaluation, the platform operates without a centralized database backend and does not collect or persist real user emails or credentials. Instead, all structural incident logs, multi-user authority signatures, and consensus tallies are dynamically managed client-side using a persistent browser local storage state engine.

---

## ✨ Core Features & Technical Highlights

### 1. Secure Gemini 3.5 Flash Audits
Built on Google developer principles, our reporting layer routes text descriptions and image payloads securely through a proxy layer directly into the **Google Gemini 3.5 Flash API**. The AI automatically:
* Categorizes the incident into standard municipal domains (e.g., PWD, Sanitation, Water Resources).
* Computes an objective **Burden Impact Score (1-100)** evaluating local infrastructure strain.
* Generates an actionable, step-by-step technical remediation protocol to assist simulated engineering crews.


### 2. Dual-Role Immersive Multi-User Simulator
A complete, end-to-end sandbox enabling judges to seamlessly toggle and test both sides of the civic infrastructure ecosystem:
* **Citizen Workspace:** Tools to submit hazard issues, search using real-time **OpenStreetMap Nominatim API** address auto-complete integration, and vote in local consensus verification blocks.
* **City Authority Workspace:** Simulates municipal agency views (e.g., Agra Municipal Corporation), granting officials the tools to claim reported tickets, log clearance notes, and upload final work-resolution photographs once field repairs are executed.



### 3. Cryptographic Citizen Consensus Protocol
To prevent paper-only repairs and bureaucratic fraud, a ticket is officially closed **only** when three separate, profile-verified neighborhood citizens physically inspect the site and submit a "YES" confirmation. A single "NO" vote triggers an automated state rollback, returning the ticket to active reported status for mandatory re-remediation.


### 4. Dynamic Diagnostic Visualization & Slate Aesthetic
* **Vector-Load Visualization:** Features a pixel-perfect, custom HTML5 canvas element that renders interactive bar layouts mapping municipal stress areas in real time.
* **Corporate Slate Profile:** An elegant corporate interface featuring **Space Grotesk** display titles, **Inter** copy text, and high-visibility **JetBrains Mono** diagnostic indicator alerts (Emerald Green, Amber Yellow, and Crimson Red).


---

## 🧰 Tech Stack
* **UI & Client Engine:** React, TypeScript, Tailwind CSS
* **Generative Core:** Google Gemini 3.5 Flash API (AI Studio Build Layer)
* **Geospatial Processing:** OpenStreetMap Nominatim API Integration
* **Data Layer:** High-Fidelity Local Storage State Engine (No External DB Pipeline)
