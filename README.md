
# Vigilancia de Cumplimiento - GA Abogados

Plataforma integral de Vigilancia de Cumplimiento Corporativo (RegTech) diseñada para que firmas legales monitoreen operaciones de clientes, gestionen riesgos y aseguren el cumplimiento normativo utilizando insights impulsados por IA.

## Características Principales

*   **Dashboard Ejecutivo**: Visualización de KPIs en tiempo real, alertas recientes y estado general del cumplimiento.
*   **Plan de Auditoría**: Gestión completa del ciclo de vida de auditorías, hallazgos y evidencias, con vistas segregadas por empresa y globales para socios.
*   **Protección de Datos**: Módulo especializado para la vigilancia de privacidad, inventario de datos y cumplimiento de normativas de protección de datos personales.
*   **Gestión de Incidentes**: Registro, seguimiento y resolución de casos de incumplimiento o riesgos operativos.
*   **Biblioteca Normativa**: Base de datos centralizada de regulaciones vigentes, en revisión o derogadas.
*   **NextLaw AI**: Asistente inteligente (integrado con Google Gemini 2.5 Flash) para análisis predictivo y recomendaciones sobre auditorías.
*   **Cultura de Riesgos**: Herramientas para evaluar y medir la percepción de riesgos y ética dentro de la organización.
*   **Portal Legal**: Centro de notificaciones para alertas críticas y cambios regulatorios que requieren atención inmediata.

## Tecnologías Utilizadas

*   **Frontend**: React 18, TypeScript, Tailwind CSS.
*   **Visualización de Datos**: Recharts.
*   **Inteligencia Artificial**: Google GenAI SDK (Gemini 2.5 Flash).
*   **Iconografía**: Lucide React.

## Configuración del Proyecto

1.  **Clonar el repositorio**:
    ```bash
    git clone <url-del-repositorio>
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la raíz del proyecto y añade tu API Key de Google Gemini:
    ```env
    API_KEY=tu_api_key_aqui
    ```

4.  **Ejecutar en Desarrollo**:
    ```bash
    npm run dev
    ```

## Estructura del Proyecto

*   `/components`: Componentes principales de las vistas (Dashboard, Incidentes, etc.).
*   `/services`: Lógica de conexión con IA (`geminiService.ts`) y simulación de base de datos local (`db.ts`).
*   `/types`: Definiciones de tipos TypeScript compartidos.

## Licencia

Este proyecto es una herramienta interna para uso de GA Abogados y sus clientes.
