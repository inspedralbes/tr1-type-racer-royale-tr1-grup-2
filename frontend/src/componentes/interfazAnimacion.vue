<script setup>
// 1. IMPORTACIONES

import { ref, onMounted, onUnmounted, markRaw } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Ruta al modelo 3D GLTF/GLB que contiene la escena y las animaciones
const URL_MODELO = "/assets/animacion-entrada.glb";

// Desplazamiento inicial en el eje Z para posicionar el modelo
const DESPLAZAMIENTO_Z = -3.0;
// Lista de nombres de animaciones del modelo que deben reproducirse al inicio
const ANIMACIONES_PERMITIDAS = ["Action", "Action.001", "Action.002"];

// Variable donde se metera la animación
const refContenedor = ref(null);

// Objetos principales de Three.js, envueltos con markRaw() para evitar que Vue los vuelva reactivos
const refEscena = ref(null);
const refCamara = ref(null);
const refRenderizador = ref(null);
const refMezclador = ref(null); // THREE.AnimationMixer: Maneja la reproducción de animaciones
const refGrupoModelo = ref(null); 
let reloj; // THREE.Clock: Se utiliza para calcular el tiempo delta entre fotogramas

// Estados reactivos, controlan el flujo del componente
const animacionesDisponibles = ref([]); 
const estaListo = ref(false); 
const estaReproduciendo = ref(false); 

// Define los eventos que podra emitir al componente padre, interfazJuego
const emit = defineEmits(["animationFinished", "animationDurationCalculated"]);


//Función central que activa solo las animaciones permitidas simultáneamente, donce calcula la duración máxima y emite los eventos de timing
 
function iniciarAnimacion() {
  if (!refMezclador.value || estaReproduciendo.value) {
    // Evita iniciar si el mezclador no está listo o si ya está en reproducción.
    return;
  }

  const mezclador = refMezclador.value;

  // Detiene cualquier acción previa que pudiera estar activa, sease animación
  mezclador.stopAllAction();
  estaReproduciendo.value = true;

  let duracionMaxima = 0;

  if (refGrupoModelo.value) {
    // Restablece la posición y rotación del modelo
    refGrupoModelo.value.position.set(0, 0, DESPLAZAMIENTO_Z);
    refGrupoModelo.value.rotation.set(0, 0, 0);
    refGrupoModelo.value.updateMatrix();
  }

  // Filtra las animaciones cargadas para obtener solo las que están en ANIMACIONES_PERMITIDAS
  const animacionesFiltradas = animacionesDisponibles.value.filter(function (anim) {
    return ANIMACIONES_PERMITIDAS.includes(anim.nombre);
  });

  if (animacionesFiltradas.length === 0) {
    console.warn(
      "ADVERTENCIA: No se encontró ninguna de las animaciones permitidas (Action, Action.001, Action.002)."
    );
    estaReproduciendo.value = false;
    return;
  }

  animacionesFiltradas.forEach(function (anim) {
    const accion = mezclador.clipAction(anim.clip);

    // Configura la animación para que se reproduzca una sola vez y se mantenga al final
    accion.setLoop(THREE.LoopOnce);
    accion.clampWhenFinished = true;

    let duracionActual = anim.clip.duration;
    accion.fadeIn(0);
    accion.reset();
    accion.play();

    // Determina la duración de la animación más larga
    if (duracionActual > duracionMaxima) {
      duracionMaxima = duracionActual;
    }
  });

  // Duración total
  const duracionMs = duracionMaxima * 1000;

  // Emite la duración total de la animación. Esto permite al componente padre (interfazJuego) programar la aparición de la UI 2D 'antes' de que termine la animación 3D.
  emit("animationDurationCalculated", duracionMaxima);

  // Es un temporizador para desactivar el estado y notificar la finalización
  setTimeout(function () {
    estaReproduciendo.value = false;
    // Emite el evento de finalización una vez que la animación 3D ha concluido, ya que lo usa interfazJuego
    emit("animationFinished", true);
  }, duracionMs + 100);
}


// FUNCIONES BÁSICAS DE THREE.JS


 // Ajusta la cámara y el renderizador cuando la ventana cambia de tamaño 
function manejarRedimensionamiento() {
  if (refRenderizador.value && refCamara.value) {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    // Actualiza el aspecto de la cámara
    refCamara.value.aspect = ancho / alto;
    refCamara.value.updateProjectionMatrix();

    // Ajusta el tamaño del canvas del renderizador
    refRenderizador.value.setSize(ancho, alto);
    refRenderizador.value.setPixelRatio(window.devicePixelRatio);
  }
}


/**
* El bucle principal de renderizado (Game Loop).
*/
function animar() {
  // Solicita el siguiente fotograma
  requestAnimationFrame(animar);

  // Calcula el tiempo transcurrido desde el último fotograma
  const delta = reloj.getDelta();

  // Actualiza el mezclador de animaciones con el tiempo delta
  if (refMezclador.value) {
    refMezclador.value.update(delta);
  }

  // Dibuja la escena
  if (refRenderizador.value && refEscena.value && refCamara.value) {
    refRenderizador.value.render(refEscena.value, refCamara.value);
  }
}


// OnMounted / OnUnmounted

onMounted(function () {
  // Inicializa el reloj
  reloj = markRaw(new THREE.Clock());

  const ancho = window.innerWidth;
  const alto = window.innerHeight;

  // Configuración de la Escena (Scene)
  const escena = new THREE.Scene();
  escena.background = null; // Fondo transparente.
  refEscena.value = markRaw(escena);

  // Configuración de la Cámara (PerspectiveCamera)
  const camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 1000);
  camara.position.set(0, 5, 10);
  refCamara.value = markRaw(camara);

  // Configuración del Renderizador (WebGLRenderer)
  const renderizador = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderizador.setSize(ancho, alto);
  renderizador.shadowMap.enabled = true; // Habilita las sombras
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
  refRenderizador.value = markRaw(renderizador);

  // Adjunta el canvas de Three.js al elemento div del template de Vue
  if (refContenedor.value) {
    refContenedor.value.appendChild(renderizador.domElement);
  }

  // Control de las luces y niebla
  escena.add(new THREE.AmbientLight(0x443300, 1)); // Luz ambiental suave

  const luzDireccional = new THREE.DirectionalLight(0xffb000, 1.5);
  luzDireccional.position.set(0, 10, 0);
  luzDireccional.castShadow = true; // La luz proyectará sombras
  escena.add(luzDireccional);

  escena.fog = new THREE.Fog(0x111111, 8, 30);

  // Carga del modelo GLTF (GLTFLoader)
  const cargador = new GLTFLoader();
  cargador.load(
    URL_MODELO,
    function (gltf) {
      escena.add(gltf.scene);
      refGrupoModelo.value = gltf.scene;

      // Activar sombras en los meshes del modelo
      gltf.scene.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true; // Permite que el nodo proyecte sombra.
          node.receiveShadow = false;
        }
      });

      refGrupoModelo.value.position.z = DESPLAZAMIENTO_Z;

      // Para usar la cámara de Blender si existe una, en mi caso si
      const camaraGltf = gltf.cameras.find(function (cam) { return cam.parent; });
      if (camaraGltf) {
        refCamara.value = camaraGltf;
        refCamara.value.aspect = ancho / alto;
        refCamara.value.updateProjectionMatrix();
      }

      // Inicializa el AnimationMixer para controlar las animaciones del modelo.
      const mezclador = new THREE.AnimationMixer(gltf.scene);
      refMezclador.value = markRaw(mezclador);

      // Almacena todas las animaciones disponibles en un array reactivo
      animacionesDisponibles.value = [];

      if (gltf.animations && gltf.animations.length > 0) {
        for (let i = 0; i < gltf.animations.length; i++) {
          const clip = gltf.animations[i];

          animacionesDisponibles.value.push({
            nombre: clip.name || `Action.${i.toString().padStart(3, "0")}`,
            clip: markRaw(clip), // markRaw para el clip (datos de animación)
          });
        }
      }

      // Compila los shaders para evitar retrasos en el primer render
      try {
        refRenderizador.value.compile(escena, refCamara.value);
        console.log("Compilación de shaders completada.");
      } catch (e) {
        console.error("Error durante la compilación de shaders:", e);
      }

      estaListo.value = true;

      iniciarAnimacion(); // Lanza la animación inicial al terminar la carga
    },
    // Función de error
    function (error) {
      console.error("ERROR AL CARGAR GLB:", error);
    }
  );

  // Inicia el bucle de renderizado, por frame, y el listener de redimensionamiento
  animar();
  window.addEventListener("resize", manejarRedimensionamiento);
});

onUnmounted(function () {
  // Limpia el listener de eventos al destruir el componente para evitar fugas de memoria
  window.removeEventListener("resize", manejarRedimensionamiento);
});
</script>

<template>
  <div class="main-container">
    <div ref="refContenedor" class="canvas-container"></div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}

.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  box-shadow: inset 0 0 100px rgba(50, 0, 0, 0.95);
}
</style>
