
  const galeraSection = document.querySelector('.destaques-da-galera');

  galeraSection.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = galeraSection.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    galeraSection.style.background = `radial-gradient(circle at ${x}% ${y}%, #f97316, #145d5d)`;
  });

  galeraSection.addEventListener('mouseleave', () => {
    galeraSection.style.background = `radial-gradient(circle at center, #f97316, #145d5d)`;
  });
