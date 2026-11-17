
"use strict";

/* =========================================
   CORAZÓN DE PARTÍCULAS 💙
   Versión corregida y optimizada
========================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas?.getContext("2d", { alpha: false });

if (!canvas || !ctx) {
    throw new Error("No se encontró el canvas.");
}

/* CONFIGURACIÓN */

const CONFIG = {
    maxParticulas: 850,
    minParticulas: 320,
    maxEstrellas: 100,
    cantidadDestellos: 22,

    colorPrincipal: "#087cff",
    colorBrillante: "#42dfff",
    colorBlanco: "#e5f8ff",

    velocidadPulso: 0.002,
    intensidadPulso: 0.035,
    duracionEntrada: 2600,

    maxDpr: 1.5,
    brillo: true
};

let ancho = 0;
let alto = 0;
let centroX = 0;
let centroY = 0;
let escala = 1;

let particulas = [];
let estrellas = [];
let destellos = [];
let explosiones = [];

let tiempo = 0;
let tiempoAnterior = 0;
let animacionId = null;
let paginaActiva = !document.hidden;
let temporizadorResize = null;

const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

/* =========================================
   AJUSTAR PANTALLA
========================================= */

function ajustarCanvas() {

    ancho = window.innerWidth;
    alto = window.innerHeight;

    const dpr = Math.min(
        window.devicePixelRatio || 1,
        CONFIG.maxDpr
    );

    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);

    canvas.style.width = ancho + "px";
    canvas.style.height = alto + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centroX = ancho / 2;

    centroY = alto * (alto < 650 ? 0.34 : 0.37);

    escala = Math.min(
        ancho / 40,
        alto / 43,
        15
    );

    crearCorazon();
    crearEstrellas();
    crearDestellos();

    dibujarEscena(tiempo, 1);
}

/* =========================================
   ECUACIÓN MATEMÁTICA DEL CORAZÓN
========================================= */

function puntoDentroDelCorazon(x, y) {

    const a = x * x + y * y - 1;

    return (
        a * a * a - x * x * y * y * y
    ) <= 0;
}

/* =========================================
   CREAR CORAZÓN
========================================= */

function crearCorazon() {

    particulas = [];

    const cantidad = Math.min(
        CONFIG.maxParticulas,
        Math.max(
            CONFIG.minParticulas,
            Math.floor(ancho * alto / 1150)
        )
    );

    let intentos = 0;

    const maxIntentos = cantidad * 18;

    while (
        particulas.length < cantidad &&
        intentos < maxIntentos
    ) {

        intentos++;

        const x = Math.random() * 2.8 - 1.4;
        const y = Math.random() * 2.8 - 1.4;

        if (!puntoDentroDelCorazon(x, y)) {
            continue;
        }

        const tono = Math.random();

        let color = CONFIG.colorPrincipal;

        if (tono > 0.965) {
            color = CONFIG.colorBlanco;
        } else if (tono > 0.68) {
            color = CONFIG.colorBrillante;
        }

        particulas.push({

            x: centroX + (Math.random() - 0.5) * ancho,

            y: alto + Math.random() * alto,

            destinoX: centroX + x * escala * 15,

            destinoY: centroY - y * escala * 15,

            tamano: Math.random() * 1.25 + 0.55,

            fase: Math.random() * Math.PI * 2,

            velocidad: Math.random() * 0.8 + 0.5,

            opacidad: Math.random() * 0.48 + 0.42,

            retraso: Math.random() * 850,

            color,

            halo: Math.random() > 0.9
        });
    }
}

/* =========================================
   CREAR ESTRELLAS
========================================= */

function crearEstrellas() {

    estrellas = [];

    const cantidad = Math.min(
        CONFIG.maxEstrellas,
        Math.floor(ancho * alto / 6500)
    );

    for (let i = 0; i < cantidad; i++) {

        estrellas.push({

            x: Math.random() * ancho,

            y: Math.random() * alto,

            tamano: Math.random() * 1.25 + 0.2,

            fase: Math.random() * Math.PI * 2,

            velocidad: Math.random() * 0.0015 + 0.0004
        });
    }
}

/* =========================================
   CREAR DESTELLOS
========================================= */

function crearDestellos() {

    destellos = [];

    for (
        let i = 0;
        i < CONFIG.cantidadDestellos;
        i++
    ) {

        destellos.push({

            x: Math.random() * ancho,

            y: Math.random() * alto,

            fase: Math.random() * Math.PI * 2,

            tamano: Math.random() * 1.5 + 0.5,

            velocidad: Math.random() * 0.0018 + 0.0007
        });
    }
}

/* =========================================
   FONDO ESPACIAL
========================================= */

function dibujarFondo(t) {

    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "#02040d";

    ctx.fillRect(0, 0, ancho, alto);

    const fondo = ctx.createRadialGradient(
        centroX,
        centroY,
        0,
        centroX,
        centroY,
        Math.max(ancho, alto) * 0.68
    );

    fondo.addColorStop(0, "#071a36");

    fondo.addColorStop(0.42, "#030d20");

    fondo.addColorStop(1, "#010208");

    ctx.fillStyle = fondo;

    ctx.fillRect(0, 0, ancho, alto);

    ctx.fillStyle = "#8bcfff";

    for (const estrella of estrellas) {

        const brillo = 0.18 + 0.72 * (
            0.5 + 0.5 * Math.sin(
                t * estrella.velocidad + estrella.fase
            )
        );

        ctx.globalAlpha = brillo;

        ctx.beginPath();

        ctx.arc(
            estrella.x,
            estrella.y,
            estrella.tamano,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    for (const destello of destellos) {

        const brillo = Math.max(
            0,
            Math.sin(
                t * destello.velocidad + destello.fase
            )
        );

        ctx.globalAlpha = brillo * 0.72;

        ctx.fillStyle = "#d7f6ff";

        ctx.beginPath();

        ctx.arc(
            destello.x,
            destello.y,
            destello.tamano,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

/* =========================================
   AURA AZUL
========================================= */

function dibujarAura(pulso) {

    const radio = escala * 18 * pulso;

    ctx.save();

    ctx.globalCompositeOperation = "lighter";

    const aura = ctx.createRadialGradient(
        centroX,
        centroY,
        escala,
        centroX,
        centroY,
        radio
    );

    aura.addColorStop(
        0,
        "rgba(0, 130, 255, 0.15)"
    );

    aura.addColorStop(
        0.38,
        "rgba(0, 95, 255, 0.08)"
    );

    aura.addColorStop(
        0.72,
        "rgba(0, 50, 200, 0.025)"
    );

    aura.addColorStop(
        1,
        "rgba(0, 0, 0, 0)"
    );

    ctx.fillStyle = aura;

    ctx.fillRect(
        centroX - radio,
        centroY - radio,
        radio * 2,
        radio * 2
    );

    ctx.restore();
}

/* =========================================
   LUZ INFERIOR
========================================= */

function dibujarLuzInferior(t) {

    const x = centroX;

    const y = centroY + escala * 13;

    const radio = escala * 9;

    const intensidad =
        0.28 + 0.12 * Math.sin(t * 0.003);

    const luz = ctx.createRadialGradient(
        x, y, 0,
        x, y, radio
    );

    luz.addColorStop(
        0,
        `rgba(0, 225, 255, ${intensidad})`
    );

    luz.addColorStop(
        0.4,
        "rgba(0, 125, 255, 0.14)"
    );

    luz.addColorStop(
        1,
        "rgba(0, 40, 255, 0)"
    );

    ctx.save();

    ctx.globalCompositeOperation = "lighter";

    ctx.fillStyle = luz;

    ctx.fillRect(
        x - radio,
        y - radio,
        radio * 2,
        radio * 2
    );

    ctx.restore();
}

/* =========================================
   LATIDO DOBLE
========================================= */

function calcularPulso(t) {

    const fase = t * CONFIG.velocidadPulso;

    return (
        Math.pow(
            Math.max(0, Math.sin(fase)),
            8
        ) * 0.7 +

        Math.pow(
            Math.max(0, Math.sin(fase - 0.65)),
            12
        ) * 0.35
    );
}

/* =========================================
   DIBUJAR CORAZÓN
========================================= */

function dibujarCorazon(t, delta) {

    const progreso = Math.min(
        1,
        t / CONFIG.duracionEntrada
    );

    const pulso =
        1 + calcularPulso(t) * CONFIG.intensidadPulso;

    const suavizadoMovimiento =
        1 - Math.pow(0.955, delta);

    ctx.save();

    ctx.globalCompositeOperation = "lighter";

    for (const p of particulas) {

        const retraso =
            p.retraso / CONFIG.duracionEntrada;

        const aparicion = Math.max(
            0,
            Math.min(
                1,
                (progreso - retraso) / (1 - retraso)
            )
        );

        const suavizadoEntrada =
            1 - Math.pow(1 - aparicion, 3);

        const destinoX =
            centroX + (p.destinoX - centroX) * pulso;

        const destinoY =
            centroY + (p.destinoY - centroY) * pulso;

        p.x +=
            (destinoX - p.x) * suavizadoMovimiento;

        p.y +=
            (destinoY - p.y) * suavizadoMovimiento;

        const flotacionX =
            Math.sin(t * 0.001 + p.fase) * 1.15;

        const flotacionY =
            Math.cos(t * 0.0012 + p.fase) * 1.35;

        const parpadeo = 0.5 + 0.5 * Math.abs(
            Math.sin(
                t * 0.0028 * p.velocidad + p.fase
            )
        );

        const alpha =
            p.opacidad * parpadeo * suavizadoEntrada;

        const x = p.x + flotacionX;

        const y = p.y + flotacionY;

        ctx.globalAlpha = alpha;

        ctx.fillStyle = p.color;

        if (CONFIG.brillo && p.halo) {

            ctx.globalAlpha = alpha * 0.14;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                p.tamano * 2.8,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.globalAlpha = alpha;
        }

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            p.tamano,
            0,
            Math.PI * 2
        );

        ctx.fill();

        if (p.tamano > 1.45 && parpadeo > 0.9) {

            ctx.globalAlpha = alpha * 0.85;

            ctx.fillStyle = "#ffffff";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                p.tamano * 0.32,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }

    ctx.restore();

    ctx.globalAlpha = 1;
}

/* =========================================
   EXPLOSIÓN DE LUCES AL HACER CLIC
========================================= */

function crearExplosion(x, y) {

    const cantidad = 34;

    for (let i = 0; i < cantidad; i++) {

        const angulo = Math.random() * Math.PI * 2;

        const velocidad = Math.random() * 2.5 + 0.8;

        explosiones.push({

            x,
            y,

            vx: Math.cos(angulo) * velocidad,

            vy: Math.sin(angulo) * velocidad,

            vida: 1,

            tamano: Math.random() * 2 + 0.8,

            color: Math.random() > 0.5
                ? CONFIG.colorBrillante
                : CONFIG.colorBlanco
        });
    }

    if (explosiones.length > 220) {

        explosiones.splice(
            0,
            explosiones.length - 220
        );
    }
}

function dibujarExplosiones(delta) {

    if (explosiones.length === 0) return;

    ctx.save();

    ctx.globalCompositeOperation = "lighter";

    for (
        let i = explosiones.length - 1;
        i >= 0;
        i--
    ) {

        const p = explosiones[i];

        p.x += p.vx * delta;

        p.y += p.vy * delta;

        p.vx *= Math.pow(0.975, delta);

        p.vy *= Math.pow(0.975, delta);

        p.vida -= 0.018 * delta;

        if (p.vida <= 0) {

            explosiones.splice(i, 1);

            continue;
        }

        ctx.globalAlpha = p.vida;

        ctx.fillStyle = p.color;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.tamano,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();

    ctx.globalAlpha = 1;
}

/* =========================================
   INTERACCIÓN CON EL CORAZÓN
========================================= */

canvas.addEventListener("pointerdown", (evento) => {

    const rect = canvas.getBoundingClientRect();

    crearExplosion(
        evento.clientX - rect.left,
        evento.clientY - rect.top
    );
});

/* =========================================
   DIBUJAR TODA LA ESCENA
========================================= */

function dibujarEscena(t, delta) {

    const pulso =
        1 + calcularPulso(t) * CONFIG.intensidadPulso;

    dibujarFondo(t);

    dibujarAura(pulso);

    dibujarLuzInferior(t);

    dibujarCorazon(t, delta);

    dibujarExplosiones(delta);
}

/* =========================================
   ANIMACIÓN
========================================= */

function animar(marcaTiempo) {

    if (!paginaActiva) {

        animacionId = null;

        return;
    }

    if (!tiempoAnterior) {
        tiempoAnterior = marcaTiempo;
    }

    const delta = Math.min(
        (marcaTiempo - tiempoAnterior) / 16.67,
        2
    );

    tiempoAnterior = marcaTiempo;

    tiempo += delta * 16.67;

    dibujarEscena(tiempo, delta);

    animacionId = requestAnimationFrame(animar);
}

/* =========================================
   CONTROL DE VISIBILIDAD
========================================= */

function controlarVisibilidad() {

    paginaActiva = !document.hidden;

    if (paginaActiva) {

        tiempoAnterior = 0;

        if (animacionId === null) {

            animacionId = requestAnimationFrame(animar);
        }

    } else if (animacionId !== null) {

        cancelAnimationFrame(animacionId);

        animacionId = null;
    }
}

/* =========================================
   MOVIMIENTO REDUCIDO
========================================= */

function controlarMovimientoReducido() {

    CONFIG.brillo = !movimientoReducido.matches;
}

if (movimientoReducido.addEventListener) {

    movimientoReducido.addEventListener(
        "change",
        controlarMovimientoReducido
    );

} else {

    movimientoReducido.addListener(
        controlarMovimientoReducido
    );
}

/* =========================================
   REDIMENSIONAR PANTALLA
========================================= */

window.addEventListener("resize", () => {

    clearTimeout(temporizadorResize);

    temporizadorResize = setTimeout(() => {

        ajustarCanvas();

    }, 160);
});

/* =========================================
   INICIAR PROYECTO
========================================= */

document.addEventListener(
    "visibilitychange",
    controlarVisibilidad
);

controlarMovimientoReducido();

ajustarCanvas();

if (paginaActiva) {

    animacionId = requestAnimationFrame(animar);
}
