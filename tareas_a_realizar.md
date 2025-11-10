flujo del administrador, gestion y analisis

Acceso al Panel de Administración
El administrador ingresa con sus credenciales de alto nivel al dashboard administrativo. Tiene acceso completo a todas las funcionalidades del sistema.

-Dashboard Principal
Al entrar, el administrador ve un panel con las métricas más importantes en tiempo real:

Ventas del día (total en dinero)
Número de transacciones realizadas
Productos más vendidos del día
Inventario con alertas de stock bajo
Gráficos de ventas comparativas (hoy vs ayer, esta semana vs semana pasada)
Indicadores clave de rendimiento (KPIs)

- Gestión de Inventario
Vista General del Inventario:
El administrador puede ver una lista completa de todos los productos en el sistema con:

Nombre del producto
Categoría
Precio
Stock disponible por talla y color
Alertas visuales para productos con stock bajo (por ejemplo, menos de 10 unidades)
Estado (activo, inactivo, agotado)

- Gestión de Facturas
Registro de Facturas:
El administrador puede ver todas las facturas generadas en el sistema:

Número de factura
Fecha y hora de emisión
Cliente que la recibió
Monto total
Estado (pagada, pendiente, anulada)
Canal de venta (online o tienda)
Método de pago utilizado

- Búsqueda de Facturas:
Puede buscar facturas específicas por:

Número de factura
Nombre del cliente
Rango de fechas
Monto
Estado

- debemos implementar el asistente e ia
 ya lo tenemos hecho en el backend ahora solo debemos crear la nueva vista para su funcionamiento

- implementar el machine learning sobre las ventas 
ya lo tenemos en el backend solo debemos hacerlo las vista para que se adapte a nuestro proyecto

- implementar configuraciones
en las configuraciones esto lo debemos crear mas adelante te dire detalles sobre como hacerlo 

- gestion de usuarios.
aquí el administrador podrá gestionar a los clientes administradores y empleados o cajeros

 
bien lo dividiremos en pequenas fases para que sea mas facil le revision de cada uno de ellos

fase 1.
1. asistente de ia ya esta implementado debemos crear la vista para el uso de la ia
- revisar el backend en la seccion reportes para ver como funciona el view, serializers y model
"backend Django\reports"

diseno del front idea
el diseno es asi cuando le de click en asistente ia, debe abrirse una ventana con transicion suave , como si se estuviera abriendo desde la derecha a la izquierda 
hay ya le colocas el disena de chat bot, y deacuerdo a lo que tenemos implementado en el backend creas el diseno listo 
ahora vamos a usar el icono de cerrar suavemente hacia la derecha, pero va tener un tipo espacio delgado para poder abrirlo otra ves, coloca dos botones uno va estar arriba que va cerrar el chat completamente y colocale uno en el medio con un icono de mesaje o bot para volver a abrir el chat bot , te voy a pasar la primer imagen para que veas o menos como quiero que sea vea el diseño o transición, de cuando esta abierto y cerrado, se ve que esta todo cuadrado y rectángulo pero tu dale estilo como para que se vea dinamico entendible y amigable

bien cuando ya este implementado quiero que lo anadas en el navbar del admin

"frontend\src\components\admin\Navbar\AdminNavbar.tsx"


en este caso quiero que le coloque Tambien el boton del microfono para que pueda hablar con el asistente mediante texto o audio 
revisa el front para ver como lo transcribe el audio 

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "es-ES";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        if (finalTranscript) {
          setDynamicPrompt(finalTranscript);
          setTranscript("");
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
        let message = "Error en el reconocimiento de voz";

        switch (event?.error) {
          case "not-allowed":
            message = "Permite el acceso al micrófono en tu navegador.";
            break;
          case "audio-capture":
            message = "No se encontró un micrófono disponible.";
            break;
          case "no-speech":
            message = "No se detectó audio. Habla más cerca del micrófono.";
            break;
          case "network":
            message = "Error de conexión. Verifica tu internet.";
            break;
        }

        setVoiceError(message);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setTranscript("");
      };
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError("Tu navegador no soporta reconocimiento de voz");
      return;
    }

2. implementar las vistas del machine learning 

revisa el backend ya lo tenemos implementado y con datos en la base datos ahora debemos hacer el front, "backend_django\ml_predictions"
cuando lo revises debes crear el front para esto del machine learning 
y despues de crear el front debes anadirlo cada cosa en el admin nav bar
""frontend\src\components\admin\Navbar\AdminNavbar.tsx""
si ves que los nombres que hay en el nav bar no son correctos deacuerdo a lo que implementaste solo cambialos