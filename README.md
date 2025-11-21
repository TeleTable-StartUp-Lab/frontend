# TeleTable Frontend

Das Frontend für das TeleTable Projekt - ein autonomes Transportsystem für den modernen Arbeitsplatz.

## 🚀 Features

- **Modernes UI/UX**: Entwickelt mit React und Tailwind CSS.
- **Authentifizierung**: Login und Registrierung mit JWT-Token-Management.
- **Dashboard**:
  - **Telemetrie**: Echtzeit-Anzeige von Status, Akkustand und Aufträgen.
  - **Steuerung**: Manuelle Steuerung und automatische Routenplanung.
- **Projekttagebuch**: Verwalten von Arbeitszeiten und Tätigkeiten.

## 🛠 Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation & Setup

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd teletable/frontend
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```
   Dies installiert alle notwendigen Pakete, die in der `package.json` definiert sind, einschließlich:
   - `react`, `react-dom`, `react-scripts`
   - `react-router-dom`
   - `axios`
   - `lucide-react`
   - `tailwindcss`, `postcss`, `autoprefixer`

3. **Umgebungsvariablen konfigurieren**
   Erstelle eine `.env` Datei im Hauptverzeichnis:
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

4. **Anwendung starten**
   ```bash
   npm start
   ```
   Die App ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

## 🏗 Build

Für die Produktion kann die App optimiert gebaut werden:

```bash
npm run build
```

Die Dateien liegen dann im `build/` Ordner bereit für das Deployment.

## 📂 Projektstruktur

```
src/
├── components/         # Wiederverwendbare UI-Komponenten
│   ├── common/        # Allgemeine Komponenten (Buttons, Inputs etc.)
│   ├── dashboard/     # Dashboard-spezifische Widgets (Telemetrie, Steuerung)
│   ├── diary/         # Tagebuch-Komponenten (Liste, Formular)
│   └── layout/        # Layout-Komponenten (Navbar, Footer, Wrapper)
├── context/           # React Context (AuthContext)
├── pages/             # Hauptseiten (Landing, Login, Dashboard, Diary)
├── services/          # API-Kommunikation (Axios Setup)
└── utils/             # Hilfsfunktionen
```

## 🎨 Design

- **Hauptfarbe**: `#98FBCD` (Mint Green)
- **Design-System**: Tailwind CSS Utility Classes

## 👥 Team

TeleTable StartUp Lab Team
