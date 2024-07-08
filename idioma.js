document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', changeLanguage);

    function changeLanguage() {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem('selectedLanguage', selectedLanguage);
        loadTranslations(selectedLanguage);
        setPlaceholder('size', 'sizePlaceholder', selectedLanguage); // Aquí se llama a setPlaceholder
    }

    function loadTranslations(language) {
        fetch(`${language}.json`)
            .then(response => response.json())
            .then(translations => {
                document.getElementById('title').textContent = translations.title;
                document.getElementById('selectPng').textContent = translations.selectPng;
                document.getElementById('text1').textContent = translations.text1;
                document.getElementById('text2').textContent = translations.text2;
                document.getElementById('processButton').textContent = translations.processButton;
                document.getElementById('downloadLink').textContent = translations.downloadLink;
                document.getElementById('backBtn').textContent = translations.backBtn;
                document.getElementById('twitter').textContent = translations.twitter;
                document.getElementById('youtube').textContent = translations.youtube;
                document.getElementById('instagram').textContent = translations.instagram;
            })
            .catch(error => console.error('Error loading translations:', error));
    }

    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    languageSelect.value = savedLanguage;
    loadTranslations(savedLanguage);
    setPlaceholder('size', 'sizePlaceholder', savedLanguage); // También se llama al cargar el idioma guardado
});

const translations = {
    'sizePlaceholder': {
        'en': 'Size',
        'es': 'Tamaño',
        // Agrega más traducciones según sea necesario para otros idiomas
    }
};

function setPlaceholder(elementId, translationKey, language) {
    const element = document.getElementById(elementId);
    if (element) {
        const translation = translations[translationKey][language];
        if (translation) {
            element.placeholder = translation;
        }
    }
}