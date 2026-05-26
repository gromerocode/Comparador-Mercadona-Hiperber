# AhorraSuper 🛒 - Comparador de Precios (Mercadona vs Hiperber)

**AhorraSuper** es una aplicación web moderna y reactiva diseñada para comparar precios de productos de alimentación en tiempo real entre dos de los principales supermercados españoles: **Mercadona** e **Hiperber**. 

La aplicación ayuda a los usuarios a optimizar su lista de la compra calculando automáticamente el supermercado más económico según su cesta actual, mostrando el porcentaje de ahorro real y presentando gráficos comparativos interactivos.

---

## ✨ Características Principales

*   **Búsqueda en Tiempo Real con Debounce (400ms):** Evita llamadas excesivas a las APIs mientras el usuario escribe y proporciona una experiencia de búsqueda fluida.
*   **Comparación Paralela (2 Columnas):** Enfoque directo visual. En móviles y escritorio, los supermercados se muestran lado a lado en dos columnas con desplazamiento vertical independiente para una comparación óptima.
*   **Cesta de la Compra Comparativa:**
    *   Suma de costes totales por supermercado de manera independiente.
    *   Indicador inteligente de ahorro (porcentaje de diferencia y cantidad exacta en euros).
    *   Gráfico comparativo nativo (SVG) adaptativo.
*   **Diseño Premium e Interactivo:** Interfaz basada en *Glassmorphism*, paleta de colores armónica, transiciones fluidas y soporte completo para **Modo Claro** y **Modo Oscuro**.
*   **Optimización Móvil Completa:**
    *   Tarjetas de producto verticales y compactas.
    *   Botón "Añadir al carrito" ampliado (`40x40px`) para evitar toques accidentales.
    *   Insignias nutricionales reducidas (calorías y Nutri-Score resumidos en móvil).
    *   Carga progresiva vertical con auto-desplazamiento suave para evitar saltos.
*   **Caché Inteligente:** Uso de `sessionStorage` para cachear búsquedas repetidas y acelerar los tiempos de respuesta.

---

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React (JavaScript, JSX).
*   **Compilador & Bundler:** Vite.
*   **Estilos:** CSS3 Nativo con variables CSS dinámicas para el sistema de temas.
*   **Iconos:** Lucide React.
*   **Backend (Proxy):** Vercel Serverless Functions (Node.js) para la gestión segura de cabeceras y evitar problemas de CORS con la API regional de Mercadona.
*   **APIs Utilizadas:**
    *   **Mercadona:** Indexación pública de Algolia y endpoints internos de actualización de código postal.
    *   **Hiperber:** API oficial del catálogo digital con normalización de formatos de empaquetado (kg, litros, unidades).

---

## 🚀 Instalación y Desarrollo Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### Requisitos Previos
*   Tener instalado **Node.js** (versión 18 o superior recomendada).
*   Un gestor de paquetes como **npm** (incluido con Node).

### Pasos
1.  **Clona este repositorio o descarga los archivos:**
    ```bash
    git clone https://github.com/gromerocode/Comparador-Mercadona-Hiperber.git
    cd Comparador-Mercadona-Hiperber
    ```

2.  **Instala las dependencias del proyecto:**
    ```bash
    npm install
    ```

3.  **Inicia el servidor de desarrollo local:**
    ```bash
    npm run dev
    ```
    *Abre tu navegador en `http://localhost:5173` para ver la aplicación en ejecución.*

4.  **Genera la compilación para producción:**
    ```bash
    npm run build
    ```
    *Este comando optimiza el código y genera los archivos finales en la carpeta `dist/`.*

---

## 📦 Despliegue en Producción (Vercel)

El proyecto está preparado de forma nativa para ser desplegado en **Vercel** en un solo clic.

1.  Vincula este proyecto a tu cuenta de GitHub.
2.  Importa el repositorio desde el panel de control de Vercel.
3.  Vercel detectará la configuración de **Vite** de forma automática.
4.  Haz clic en **Deploy**. 

*El archivo `vercel.json` configurará el proxy de redirección `/api/mercadona` automáticamente como una Serverless Function para evitar bloqueos por CORS al cambiar de código postal.*

---

## 📄 Licencia

Este proyecto es de código abierto. Puedes utilizarlo, modificarlo y distribuirlo libremente.
