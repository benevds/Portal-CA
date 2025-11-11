// Espera a página carregar
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicia o tsParticles
    tsParticles.load({
        id: "particles-js", // O ID do "quadro" que colocamos no HTML
        options: {
            background: {
                color: {
                    value: "transparent" // O fundo é transparente (vamos ver o gradiente roxo)
                }
            },
            fpsLimit: 60, // Limita a 60 FPS para não gastar muita CPU
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "grab" // Puxa as linhas com o mouse
                    },
                    onClick: {
                        enable: true,
                        mode: "push" // Empurra partículas ao clicar
                    }
                },
                modes: {
                    grab: {
                        distance: 140,
                        links: {
                            opacity: 1
                        }
                    },
                    push: {
                        quantity: 4
                    }
                }
            },
            particles: {
                color: {
                    value: "#ffffff" // Cor das partículas: BRANCO
                },
                links: { // As linhas de "rede"
                    color: "#ffffff",
                    distance: 150,
                    enable: true,
                    opacity: 0.4, // Linhas semi-transparentes
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2, // Velocidade
                    direction: "none",
                    outModes: "out"
                },
                number: {
                    density: {
                        enable: true,
                    },
                    value: 80 // Quantidade de partículas
                },
                opacity: {
                    value: 0.5 // Partículas semi-transparentes
                },
                shape: {
                    type: "circle"
                },
                size: {
                    value: { min: 1, max: 3 } // Tamanho aleatório
                }
            },
            detectRetina: true
        }
    });
});