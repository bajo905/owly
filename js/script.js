const input = document.getElementById('searchInput');
const searchbutton = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('result');

searchbutton.addEventListener('click', async () => {
  const category = input.value.trim();

  if (!category) {
    alert('Inserisci una categoria!');
    return;
  }

  const url = `https://openlibrary.org/subjects/${category}.json`;
  resultsContainer.innerHTML = '<p>Caricamento libri...</p>';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Categoria non trovata o errore di rete');
    const data = await response.json();
    const books = data.works;

    resultsContainer.innerHTML = '';

    if (!books || books.length === 0) {
      resultsContainer.textContent = 'Nessun libro trovato.';
      return;
    }

    books.forEach(book => {
      const title = book.title;
      const authors = book.authors.map(a => a.name).join(', ');

      const bookElement = document.createElement('div');
      bookElement.classList.add('book');
      bookElement.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Autori:</strong> ${authors}</p>
        <button class="btn" aria-expanded="false" data-key="${book.key}">Mostra descrizione</button>
        <div class="description"></div>
      `;

      resultsContainer.appendChild(bookElement);
    });

    attachDescriptionHandlers();

  } catch (error) {
    resultsContainer.textContent = `Errore: ${error.message}`;
  }
});

function attachDescriptionHandlers() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const btn = e.target;
      const card = btn.closest('.book');
      const desc = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        // Chiudi descrizione
        desc.classList.remove('open');  // nasconde descrizione
        card.classList.remove('full-width'); // torna al layout a griglia
        btn.textContent = 'Mostra descrizione';
        btn.setAttribute('aria-expanded', 'false');
        return;
      }

      // Se non è già caricata, fai la fetch
      if (!desc.dataset.loaded) {
        desc.textContent = 'Caricamento descrizione...';

        try {
          const key = btn.dataset.key;
          const response = await fetch(`https://openlibrary.org${key}.json`);
          if (!response.ok) throw new Error('Errore nel recupero della descrizione');
          const bookData = await response.json();

          let descriptionText = 'Descrizione non disponibile.';
          if (bookData.description) {
            descriptionText = typeof bookData.description === 'string'
              ? bookData.description
              : bookData.description.value;
          }

          desc.textContent = descriptionText;
          desc.dataset.loaded = 'true';
        } catch (err) {
          desc.textContent = `Errore: ${err.message}`;
        }
      }

      // Mostra descrizione e espandi card
      desc.classList.add('open');
      card.classList.add('full-width');
      btn.textContent = 'Mostra meno';
      btn.setAttribute('aria-expanded', 'true');
    });
  });
}
