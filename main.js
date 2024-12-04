class RickAndMortyApp {
    constructor() {
        this.characters = [];
        this.filteredCharacters = [];
        this.currentPage = 1;
        this.pageSize = 25; // Sayfa başına gösterim sayısını 25 yaptık
        this.totalPages = 0;

        // Sayfa yüklendiğinde karakterleri çek
        this.init();
    }

    async init() {
        try {
            document.getElementById('loading').style.display = 'block';
            
            // İlk 250 karakteri çekmek için gerekli sayfa sayısını hesapla
            let allCharacters = [];
            for(let page = 1; page <= 13; page++) { // 20 karakter/sayfa, 13 sayfa = 260 karakter
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
                if (!response.ok) throw new Error('API isteği başarısız oldu');
                const data = await response.json();
                allCharacters = [...allCharacters, ...data.results];
            }

            // İlk 250 karakteri al
            this.characters = allCharacters.slice(0, 250);
            this.filteredCharacters = [...this.characters];
            
            // Tabloyu güncelle
            this.updateTable();
            document.getElementById('loading').style.display = 'none';

        } catch (error) {
            console.error('Veri çekme hatası:', error);
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = 'Veriler yüklenirken bir hata oluştu!';
        }
    }

    updateTable() {
        const tableBody = document.getElementById('tableBody');
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const paginatedCharacters = this.filteredCharacters.slice(start, end);

        // Tablo içeriğini temizle ve yeni verileri ekle
        tableBody.innerHTML = '';
        
        paginatedCharacters.forEach(char => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${char.image}" alt="${char.name}" style="width: 50px; height: 50px; border-radius: 50%;">
                    ${char.name}
                </td>
                <td>${char.status}</td>
                <td>${char.species}</td>
                <td>${char.gender}</td>
                <td>${char.origin.name}</td>
            `;
            row.onclick = () => this.showCharacterDetail(char.id);
            tableBody.appendChild(row);
        });

        this.updatePagination();

        // Sonuç yoksa mesaj göster
        document.getElementById('noResults').style.display = 
            this.filteredCharacters.length === 0 ? 'block' : 'none';
    }

    filterCharacters() {
        const nameFilter = document.getElementById('nameFilter').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
        const speciesFilter = document.getElementById('speciesFilter').value.toLowerCase();
        const genderFilter = document.getElementById('genderFilter').value.toLowerCase();

        this.filteredCharacters = this.characters.filter(char => {
            return char.name.toLowerCase().includes(nameFilter) &&
                   (statusFilter === '' || char.status.toLowerCase() === statusFilter) &&
                   char.species.toLowerCase().includes(speciesFilter) &&
                   (genderFilter === '' || char.gender.toLowerCase() === genderFilter);
        });

        this.currentPage = 1;
        this.updateTable();
    }

    showCharacterDetail(id) {
        const character = this.characters.find(c => c.id === id);
        if (!character) return;

        const detailDiv = document.getElementById('characterDetail');
        detailDiv.innerHTML = `
            <div class="detail-card">
                <img src="${character.image}" alt="${character.name}">
                <div class="detail-info">
                    <h2>${character.name}</h2>
                    <p><strong>Status:</strong> ${character.status}</p>
                    <p><strong>Species:</strong> ${character.species}</p>
                    <p><strong>Gender:</strong> ${character.gender}</p>
                    <p><strong>Origin:</strong> ${character.origin.name}</p>
                    <p><strong>Location:</strong> ${character.location.name}</p>
                </div>
            </div>
        `;
        detailDiv.style.display = 'block';
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredCharacters.length / this.pageSize);
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === this.totalPages;
        document.getElementById('currentPage').textContent = `Sayfa: ${this.currentPage}`;
    }

    changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.updateTable();
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const app = new RickAndMortyApp();

    // Filtre event listeners
    document.getElementById('nameFilter').addEventListener('input', () => app.filterCharacters());
    document.getElementById('statusFilter').addEventListener('change', () => app.filterCharacters());
    document.getElementById('speciesFilter').addEventListener('input', () => app.filterCharacters());
    document.getElementById('genderFilter').addEventListener('change', () => app.filterCharacters());
    
    // Sayfalama event listeners
    document.getElementById('prevPage').addEventListener('click', () => app.changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => app.changePage(1));
    
    // Sayfa boyutu değişimi
    document.getElementById('pageSize').addEventListener('change', (e) => {
        app.pageSize = parseInt(e.target.value);
        app.currentPage = 1;
        app.updateTable();
    });
});