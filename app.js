document.addEventListener('DOMContentLoaded', () => {
    const pencil = document.getElementById('pencil');
    const canvasContainer = document.getElementById('canvasContainer');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const doneBtn = document.getElementById('doneBtn');
    const ctx = drawingCanvas.getContext('2d');

    let isDrawing = false;
    const maxCanvasLimit = 50;
    const overlayCanvasQueue = [];
    let currentZIndex = 1;

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 10;

    function resizeCanvas() {
        drawingCanvas.width = window.innerWidth * 0.8;
        drawingCanvas.height = window.innerHeight * 0.8;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getEventCoordinates(event) {
        if (event.touches && event.touches[0]) {
            return { x: event.touches[0].clientX - drawingCanvas.offsetLeft, y: event.touches[0].clientY - drawingCanvas.offsetTop };
        } else {
            return { x: event.offsetX, y: event.offsetY };
        }
    }

    pencil.addEventListener('click', () => {
        canvasContainer.classList.remove('hidden');
    });

    const colorButtons = document.querySelectorAll('.colorBtn');
    colorButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            ctx.strokeStyle = event.target.style.backgroundColor;
            colorButtons.forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
        });
    });

    function startDrawing(event) {
        const { x, y } = getEventCoordinates(event);
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(x, y);
        event.preventDefault();
    }

    function draw(event) {
        if (!isDrawing) return;
        const { x, y } = getEventCoordinates(event);
        ctx.lineTo(x, y);
        ctx.stroke();
        event.preventDefault();
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.closePath();
    }

    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing);

    drawingCanvas.addEventListener('touchstart', startDrawing);
    drawingCanvas.addEventListener('touchmove', draw);
    drawingCanvas.addEventListener('touchend', stopDrawing);

    doneBtn.addEventListener('click', () => {
        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.id = 'overlayCanvas';
        overlayCanvas.style.position = 'absolute';
        overlayCanvas.style.zIndex = currentZIndex + '';
        currentZIndex++;
        document.body.appendChild(overlayCanvas);

        const overlayCtx = overlayCanvas.getContext('2d');
        overlayCanvas.width = window.innerWidth;
        overlayCanvas.height = window.innerHeight;

        overlayCtx.globalAlpha = 1;
        overlayCtx.drawImage(drawingCanvas, 0, 0, drawingCanvas.width, drawingCanvas.height, 0, 0, overlayCanvas.width, overlayCanvas.height);

        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

        canvasContainer.classList.add('hidden');

        overlayCanvasQueue.push(overlayCanvas);

        if (overlayCanvasQueue.length > maxCanvasLimit) {
            const oldestCanvas = overlayCanvasQueue.shift();
            document.body.removeChild(oldestCanvas);
        }
    });
});
