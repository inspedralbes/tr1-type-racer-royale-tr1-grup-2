<script setup>
import { ref, defineProps, onMounted, onUnmounted } from "vue";
// import communicationManager from "../services/communicationManager";

function toggleDoor() {
  if (!isOpen.value) {
    console("Has abierto la puerta!");
  }
}
</script>

<template>
  <div class="scene">
    <div class="room">
      <div class="wall wall-back">
        <div class="wall-light"></div>
        <div class="door-frame" @click="toggleDoor">
          <div class="garage-door" :class="{ open: isOpen }"></div>
        </div>
      </div>

      <div class="wall wall-floor"></div>

      <div class="wall wall-left"></div>
      <div class="wall wall-right"></div>

      <div class="wall wall-top"></div>
    </div>
    <div class="illuminated-area"></div>
  </div>
</template>

<style scoped>
/* La escena 3D */
.scene {
  --room-width: 100vw;
  --room-height: 100vh;
  --room-depth: 30vw;

  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  background-color: black;

  /* Perspectiva para la "cámara" */
  perspective: 700px;
}

.room {
  width: 100%;
  height: 100%;
  position: relative;
  /* Activa el espacio 3D */
  transform-style: preserve-3d;
}
.wall {
  position: absolute;
  box-sizing: border-box;
}

.wall-back {
  width: var(--room-width);
  height: var(--room-height);

  /*Imegen bloques hormigo*/
  background-image: url(../../public/assets/img/fondo-con-textura-de-pared-de-ladrillo-moderno.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  /* La empuja "lejos" de nosotros en el eje Z */
  transform: translateZ(calc(var(--room-depth) * -1));
}

.wall-floor {
  width: calc(var(--room-width));
  height: calc(var(--room-depth));

  /*Imagen asfalto*/
  background-image: url(../../public/assets/img/Gemini_Generated_Image_88n9iy88n9iy88n9.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  /* La alineamos al suelo de la pantalla */
  bottom: 0;
  /* La giramos 90 grados "hacia arriba" desde su borde inferior */
  transform-origin: bottom;
  transform: rotateX(90deg);
}

.wall-left {
  width: var(--room-depth); /* El "ancho" de la pared es la profundidad */
  height: var(--room-height);
  left: 0;
  transform-origin: left;
  transform: rotateY(90deg);

  background-image: url(../../public/assets/img/fondo-con-textura-de-pared-de-ladrillo-moderno.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.wall-right {
  width: var(--room-depth);
  height: var(--room-height);
  right: 0;
  transform-origin: right;
  transform: rotateY(-90deg);

  background-image: url(../../public/assets/img/fondo-con-textura-de-pared-de-ladrillo-moderno.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.wall-top {
  width: calc(var(--room-width));
  height: calc(var(--room-depth));

  /*Imagen asfalto*/
  background-image: url(../../public/assets/img/coloridas-luces-del-horizonte-en-el-cielo.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  /* La alineamos al suelo de la pantalla */
  top: 0;
  /* La giramos 90 grados "hacia arriba" desde su borde inferior */
  transform-origin: top;
  transform: rotateX(-90deg);
}

.door-frame {
  position: absolute;
  top: 30%;
  left: 50%;
  width: 80vw;
  height: 80vh;
  transform: translateX(-50%) translateZ(2px);
  box-sizing: border-box; /* Importante */
  overflow: hidden;
  z-index: 1; /* Por debajo de la luz */
}

.garage-door {
  width: 100%;
  height: 100%;
  background-color: #1a2a3a; /* Un color base azul oscuro, similar al de la imagen */
  position: relative;
  overflow: hidden;

  /* --- Múltiples background-image para la textura --- */

  /* 1. Las franjas principales (más grandes) y su sombra interior/superior */
  background-image: 
    /* Sombra superior para dar relieve (claro) */ linear-gradient(
      to top,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 10%
    ),
    /* Sombra inferior para dar relieve (oscuro) */
      linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, transparent 10%),
    /* Una textura de ruido sutil o perforaciones (patrón repetitivo) */
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="1" height="1" fill="%23303030"/><rect x="1" y="1" width="1" height="1" fill="%23303030"/></svg>');
  /* Puedes usar una imagen real de ruido o puntos si tienes una mejor */

  /* Posicionamiento y tamaño de los backgrounds */
  background-size: 100% 10%,
    /* Las sombras de los relieves se repiten cada 10% */ 100% 10%, 2px 2px; /* El patrón de ruido es muy pequeño */

  background-position: 0% 0%, /* Las sombras empiezan arriba */ 0% 0%,
    /* Las sombras empiezan arriba */ 0px 0px; /* El ruido empieza en la esquina */

  background-repeat: repeat-y,
    /* Las sombras se repiten verticalmente */ repeat-y, repeat; /* El ruido se repite en todas direcciones */

  /* Esto crea un sutil relieve en cada segmento */
  /* Lo ajustamos para que complemente los backgrounds */
  box-shadow: inset 0px 1px 2px rgba(255, 255, 255, 0.05),
    /* Luz sutil superior */ inset 0px -1px 2px rgba(0, 0, 0, 0.3); /* Sombra sutil inferior */

  /* Transición para la apertura */
  transition: transform 1s ease-out;
  transform-origin: top center;
}

.garage-door.open {
  transform: translateY(-100%);
}

/*Iluminación pagina*/

.illuminated-area {
  pointer-events: none; /*¡Importante!*/

  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background: radial-gradient(
    ellipse at center,
    transparent 5%,
    rgba(0, 0, 0, 1) 90%,
    black 100%
  );
}

.wall-light::before {
  content: "";
  position: absolute;
  top: -0.5vh;
  left: -1%;
  width: 102%; /* 100% de la lámpara + 2% */
  height: 2.5vh;
  background-color: black; /* Color */
  border-radius: 0.8vh;
  z-index: 3; /*Por encima de la lampara*/
}

.wall-light {
  position: absolute;
  top: 20vh;
  left: 50vw;
  width: 50vw;
  height: 5vh;
  transform: translateX(-25vw);
  background-color: #f7f0e3;
  border-radius: 2.5vh;
  z-index: 2; /* Por encima de la puerta */
}

.wall-light::after {
  content: "";
  position: absolute;
  top: 3vh;
  left: -15vw;
  width: 80vw; /*Ancho de la luz*/
  height: 75vh; /*Altura de la luz */

  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(255, 255, 220, 0.35) 0%,
    transparent 80%
  );

  filter: blur(15px);

  z-index: -1;
  pointer-events: none;
}
</style>
