// 2.5D Perspective projection system
//
// World coordinate system:
//   x = left/right (negative=left, positive=right from home plate)
//   y = height above ground
//   z = depth (0 = home plate, positive = toward outfield)

// Camera presets
const CAMERAS = {
    batting: {
        x: 0,
        y: 20,
        z: -25,
        fov: 420,
        screenCenterX: 640,
        screenCenterY: 380,
    },
    pitching: {
        x: 0,
        y: 15,
        z: 120,
        fov: 400,
        screenCenterX: 640,
        screenCenterY: 400,
    },
    field: {
        x: 0,
        y: 80,
        z: -50,
        fov: 350,
        screenCenterX: 640,
        screenCenterY: 250,
    },
};

let currentCamera = CAMERAS.field;
let targetCamera = null;
let cameraLerpT = 1;
let activeCamera = { ...CAMERAS.field };

export function setCamera(preset) {
    if (CAMERAS[preset]) {
        targetCamera = CAMERAS[preset];
        cameraLerpT = 0;
    }
}

export function setCameraImmediate(preset) {
    if (CAMERAS[preset]) {
        currentCamera = CAMERAS[preset];
        activeCamera = { ...CAMERAS[preset] };
        targetCamera = null;
        cameraLerpT = 1;
    }
}

export function updateCamera(dt) {
    if (targetCamera && cameraLerpT < 1) {
        cameraLerpT = Math.min(1, cameraLerpT + dt * 2);
        const t = easeInOut(cameraLerpT);
        activeCamera.x = lerp(currentCamera.x, targetCamera.x, t);
        activeCamera.y = lerp(currentCamera.y, targetCamera.y, t);
        activeCamera.z = lerp(currentCamera.z, targetCamera.z, t);
        activeCamera.fov = lerp(currentCamera.fov, targetCamera.fov, t);
        activeCamera.screenCenterX = lerp(currentCamera.screenCenterX, targetCamera.screenCenterX, t);
        activeCamera.screenCenterY = lerp(currentCamera.screenCenterY, targetCamera.screenCenterY, t);

        if (cameraLerpT >= 1) {
            currentCamera = targetCamera;
            activeCamera = { ...targetCamera };
            targetCamera = null;
        }
    }
}

export function worldToScreen(wx, wy, wz) {
    const cam = activeCamera;
    const relX = wx - cam.x;
    const relY = wy - cam.y;
    const relZ = wz - cam.z;

    if (relZ <= 1) return null; // behind camera

    const scale = cam.fov / relZ;
    const screenX = cam.screenCenterX + relX * scale;
    const screenY = cam.screenCenterY - relY * scale;

    return { x: screenX, y: screenY, scale };
}

export function getDepthScale(wz) {
    const cam = activeCamera;
    const relZ = wz - cam.z;
    if (relZ <= 1) return 0;
    return cam.fov / relZ;
}

export function getActiveCamera() {
    return { ...activeCamera };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
