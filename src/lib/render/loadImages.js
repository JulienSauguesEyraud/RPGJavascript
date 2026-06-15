export async function loadImages(visuals) {
    const promises = Object.entries(visuals).map(([key, visual]) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = visual.path;
            img.onload = () => {
                visual.image = img;
                resolve();
            };
            img.onerror = () => {
                console.error(`Erreur de chargement pour : ${visual.path}`);
                resolve();
            };
        });
    });
    await Promise.all(promises);
}