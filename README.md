# 💰 Control de Gastos — Frontend

Aplicación web desarrollada con **Angular** para la gestión financiera personal con inteligencia artificial integrada.

## ✨ Funcionalidades

- **Dashboard** — Resumen visual de gastos con gráficos y estadísticas
- **Gestión de gastos** — Registro, edición y eliminación de gastos por categoría
- **Calendario** — Vista de gastos y eventos por fecha
- **Asistente IA** — Chat con IA para análisis y recomendaciones financieras personalizadas
- **Perfil de usuario** — Gestión de cuenta y preferencias
- **Autenticación** — Login y registro con guards de navegación

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| Angular 20 | Framework principal |
| TypeScript | Lenguaje principal |
| Angular Material | Componentes UI |
| Angular Router | Navegación con guards |
| RxJS | Programación reactiva |
| SCSS | Estilos personalizados |

## 🏗️ Arquitectura

```
src/app/
├── pages/            # Componentes de página
│   ├── dashboard/    # Panel principal con gráficos
│   ├── gastos/       # Listado y gestión de gastos
│   ├── calendario/   # Vista calendario
│   ├── ia/           # Chat con asistente IA
│   └── login/        # Autenticación
├── services/         # Servicios HTTP (gastos, categorías, IA, auth)
├── models/           # Interfaces TypeScript
├── guards/           # Auth guard y login guard
└── app.routes.ts     # Configuración de rutas
```

## 🚀 Instalación y ejecución

### Requisitos
- Node.js 18+
- Angular CLI 20+

### Pasos

1. Clona el repositorio:
```bash
git clone https://github.com/diaz2806/tfg-frontend.git
cd tfg-frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura el entorno en `src/enviroments/enviroment.ts` con la URL de tu backend.

4. Ejecuta el servidor de desarrollo:
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## 🔗 Repositorio backend

La API REST que consume este frontend está en [tfg-backend](https://github.com/diaz2806/tfg-backend) — desarrollada con Spring Boot y Java 21.

---

*Trabajo de Fin de Grado — Alberto Díaz*
