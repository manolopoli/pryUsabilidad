document.addEventListener("DOMContentLoaded", () => {
  // 1. Elementos del DOM
  const formulario = document.getElementById("formulario-registro");
  const entradaNombre = document.getElementById("nombre-completo");
  const entradaCorreo = document.getElementById("correo");
  const entradaClave = document.getElementById("clave");
  const botonAlternarClave = document.getElementById("boton-alternar-clave");
  
  const botonEnviar = document.getElementById("boton-enviar");
  const textoBotonEnviar = botonEnviar.querySelector(".texto-boton");
  const iconoCargando = botonEnviar.querySelector(".icono-cargando");
  const panelEstado = document.getElementById("panel-estado");

  const barraProgreso = document.getElementById("barra-progreso");
  const etiquetaSeguridad = document.getElementById("etiqueta-seguridad");
  const reglaLongitud = document.getElementById("regla-longitud");
  const reglaNumero = document.getElementById("regla-numero");
  const reglaMayuscula = document.getElementById("regla-mayuscula");

  // 2. Reglas de validación con retroalimentación clara
  const validadores = {
    validarNombre(valor) {
      const textoLimpio = valor.trim();
      if (!textoLimpio) return "Ingresa tu nombre y apellido.";
      const palabras = textoLimpio.split(/\s+/);
      if (palabras.length < 2) return "Por favor escribe al menos un nombre y un apellido.";
      return null;
    },
    validarCorreo(valor) {
      const textoLimpio = valor.trim();
      if (!textoLimpio) return "El correo es obligatorio.";
      const patronInstitucional = /^[^\s@]+@institucion\.edu\.co$/;
      if (!patronInstitucional.test(textoLimpio)) {
        return "El correo debe terminar en @institucion.edu.co.";
      }
      return null;
    },
    validarClave(valor) {
      if (!valor) return "Debes ingresar una contraseña.";
      if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
      if (!/\d/.test(valor)) return "La contraseña debe incluir al menos un número.";
      if (!/[A-Z]/.test(valor)) return "La contraseña debe incluir al menos una mayúscula.";
      return null;
    }
  };

  // 3. Función para actualizar el estado visual y accesible de cada campo
  function actualizarEstadoCampo(elementoEntrada, mensajeError) {
    const grupoPadre = elementoEntrada.closest(".grupo-campo");
    const contenedorError = document.getElementById(`error-${elementoEntrada.id === "nombre-completo" ? "nombre" : elementoEntrada.id}`);

    if (mensajeError) {
      grupoPadre.classList.add("con-error");
      grupoPadre.classList.remove("es-valido");
      contenedorError.textContent = mensajeError;
      elementoEntrada.setAttribute("aria-invalid", "true");
    } else {
      grupoPadre.classList.remove("con-error");
      grupoPadre.classList.add("es-valido");
      contenedorError.textContent = "";
      elementoEntrada.removeAttribute("aria-invalid");
    }
  }

  // 4. Medidor de robustez de contraseña
  function calcularRobustezClave(claveIngresada) {
    const cumpleLongitud = claveIngresada.length >= 8;
    const cumpleNumero = /\d/.test(claveIngresada);
    const cumpleMayuscula = /[A-Z]/.test(claveIngresada);

    // Actualización visual de las reglas
    reglaLongitud.classList.toggle("cumplida", cumpleLongitud);
    reglaNumero.classList.toggle("cumplida", cumpleNumero);
    reglaMayuscula.classList.toggle("cumplida", cumpleMayuscula);

    // Conteo de puntos
    let puntuacion = 0;
    if (cumpleLongitud) puntuacion++;
    if (cumpleNumero) puntuacion++;
    if (cumpleMayuscula) puntuacion++;

    barraProgreso.setAttribute("data-puntuacion", claveIngresada.length === 0 ? "0" : puntuacion.toString());
    barraProgreso.setAttribute("aria-valuenow", puntuacion.toString());

    const nivelesSeguridad = {
      0: "Sin ingresar",
      1: "Débil (insegura)",
      2: "Media (aceptable)",
      3: "Robusta (segura)"
    };

    etiquetaSeguridad.textContent = `Seguridad: ${claveIngresada.length === 0 ? nivelesSeguridad[0] : nivelesSeguridad[puntuacion]}`;
  }

  // 5. Botón para alternar visibilidad de contraseña
  botonAlternarClave.addEventListener("click", () => {
    const tipoActual = entradaClave.getAttribute("type");
    const esOculta = tipoActual === "password";

    entradaClave.setAttribute("type", esOculta ? "text" : "password");
    botonAlternarClave.textContent = esOculta ? "Ocultar" : "Mostrar";
    botonAlternarClave.setAttribute("aria-label", esOculta ? "Ocultar contraseña" : "Mostrar contraseña");
  });

  // 6. Asignación de eventos respetando la experiencia del usuario
  // Al salir del campo (blur): se evalúa y se advierte si hay error
  entradaNombre.addEventListener("blur", () => {
    actualizarEstadoCampo(entradaNombre, validadores.validarNombre(entradaNombre.value));
  });
  // Al teclear (input): solo re-evalúa si el campo ya estaba marcado en error
  entradaNombre.addEventListener("input", () => {
    if (entradaNombre.closest(".grupo-campo").classList.contains("con-error")) {
      actualizarEstadoCampo(entradaNombre, validadores.validarNombre(entradaNombre.value));
    }
  });

  entradaCorreo.addEventListener("blur", () => {
    actualizarEstadoCampo(entradaCorreo, validadores.validarCorreo(entradaCorreo.value));
  });
  entradaCorreo.addEventListener("input", () => {
    if (entradaCorreo.closest(".grupo-campo").classList.contains("con-error")) {
      actualizarEstadoCampo(entradaCorreo, validadores.validarCorreo(entradaCorreo.value));
    }
  });

  entradaClave.addEventListener("input", () => {
    calcularRobustezClave(entradaClave.value);
    if (entradaClave.closest(".grupo-campo").classList.contains("con-error")) {
      actualizarEstadoCampo(entradaClave, validadores.validarClave(entradaClave.value));
    }
  });
  entradaClave.addEventListener("blur", () => {
    actualizarEstadoCampo(entradaClave, validadores.validarClave(entradaClave.value));
  });

  // 7. Envío del Formulario
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // Validar todo el conjunto de campos
    const errorNombre = validadores.validarNombre(entradaNombre.value);
    const errorCorreo = validadores.validarCorreo(entradaCorreo.value);
    const errorClave = validadores.validarClave(entradaClave.value);

    actualizarEstadoCampo(entradaNombre, errorNombre);
    actualizarEstadoCampo(entradaCorreo, errorCorreo);
    actualizarEstadoCampo(entradaClave, errorClave);

    // Si existen errores: notificar y mover foco al primer campo con fallo
    if (errorNombre || errorCorreo || errorClave) {
      panelEstado.className = "panel-estado error";
      panelEstado.textContent = "Por favor corrige los campos marcados en rojo antes de enviar.";
      
      const primerCampoInvalido = formulario.querySelector(".con-error input");
      if (primerCampoInvalido) {
        primerCampoInvalido.focus();
      }
      return;
    }

    // Estado de carga visible y prevención de envíos dobles
    botonEnviar.disabled = true;
    textoBotonEnviar.textContent = "Procesando...";
    iconoCargando.style.display = "inline-block";
    panelEstado.style.display = "none";

    // Simulación de respuesta de red (1.8 segundos)
    setTimeout(() => {
      botonEnviar.disabled = false;
      textoBotonEnviar.textContent = "Registrar cuenta";
      iconoCargando.style.display = "none";

      panelEstado.className = "panel-estado exito";
      panelEstado.textContent = "¡Registro exitoso! Se ha enviado un enlace de confirmación a tu correo.";

      formulario.reset();
      calcularRobustezClave("");
      document.querySelectorAll(".grupo-campo").forEach(grupo => {
        grupo.classList.remove("es-valido", "con-error");
      });
    }, 1800);
  });
});