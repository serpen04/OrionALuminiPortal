// 1. --- PASTE YOUR SUPABASE URL AND KEY HERE ---
const SUPABASE_URL = https://pyiykmalduhdjyfhxmtn.supabase.com; 
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aXlrbWFsZHVoZGp5Zmh4bXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzY5ODYsImV4cCI6MjA3NzE1Mjk4Nn0.WoHb3WCzOhAP-aY5KFy4Zf0VB9nlRT5nsAT-43nODDY; 

// --- We'll use the Supabase client library to make it easy ---
// (We will add this to our HTML files in the next step)

// This creates our 'database' connection
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized');


document.addEventListener('DOMContentLoaded', () => {

    // --- COMMON CODE (Runs on all pages) ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    function populateBatchYears(selectElement) {
        if (!selectElement) return;
        
        const currentYear = new Date().getFullYear();
        const startYear = 1982;
        
        const firstOption = selectElement.options[0];
        selectElement.innerHTML = '';
        selectElement.appendChild(firstOption);

        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            selectElement.appendChild(option);
        }
    }

    // --- PAGE-SPECIFIC CODE for add.html ---
    const alumniForm = document.getElementById('alumni-form');
    if (alumniForm) {
        populateBatchYears(document.getElementById('batch'));
        
        const formMessage = document.getElementById('form-message');

        alumniForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            formMessage.textContent = "Submitting...";
            formMessage.className = 'message';

            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                branch: document.getElementById('branch').value,
                workplace: document.getElementById('workplace').value,
                // Make sure batch is sent as a string if your column is 'text'
                batch: document.getElementById('batch').value 
            };
            
            // --- REAL DATABASE SUBMISSION ---
            const { data, error } = await _supabase
                .from('alumni') // Your table name
                .insert([formData]);

            if (error) {
                console.error('Error submitting data:', error);
                formMessage.textContent = `Error: ${error.message}`;
                formMessage.className = 'message error';
            } else {
                console.log('Data submitted:', data);
                formMessage.textContent = "Your information has been submitted successfully!";
                formMessage.className = 'message success';
                alumniForm.reset();
            }
            // --- END REAL SUBMISSION ---
        });
    }

    // --- PAGE-SPECIFIC CODE for view.html ---
    const loadDataBtn = document.getElementById('load-data-btn');
    if (loadDataBtn) {
        const viewBatchSelect = document.getElementById('view-batch');
        populateBatchYears(viewBatchSelect);

        const alumniListDiv = document.getElementById('alumni-list');
        const viewMessage = document.getElementById('view-message');

        loadDataBtn.addEventListener('click', async () => {
            const selectedBatch = viewBatchSelect.value;
            alumniListDiv.innerHTML = ''; // Clear results
            viewMessage.style.display = 'block';

            if (!selectedBatch) {
                viewMessage.textContent = "Please select a batch year to view.";
                return;
            }

            viewMessage.textContent = `Loading data for Batch ${selectedBatch}...`;

            // --- REAL DATABASE QUERY ---
            const { data, error } = await _supabase
                .from('alumni') // Your table name
                .select('*') // Get all columns
                .eq('batch', selectedBatch); // Where 'batch' equals selectedBatch

            if (error) {
                console.error('Error loading data:', error);
                viewMessage.textContent = `Error loading data: ${error.message}`;
            } else if (data.length === 0) {
                viewMessage.textContent = `No alumni found for Batch ${selectedBatch}.`;
            } else {
                viewMessage.textContent = `Showing ${data.length} alumni for Batch ${selectedBatch}.`;
                
                data.forEach(alum => {
                    const card = document.createElement('div');
                    card.className = 'alumni-card';
                    card.innerHTML = `
                        <h3>${alum.name}</h3>
                        <p><strong>Batch:</strong> ${alum.batch}</p>
                        <p><strong>Branch:</strong> ${alum.branch}</p>
                        <p><strong>Email:</strong> ${alum.email}</p>
                        <p><strong>Phone:</strong> ${alum.phone}</p>
                        <p><strong>Workplace:</strong> ${alum.workplace || 'N/A'}</p>
                    `;
                    alumniListDiv.appendChild(card);
                });
            }
            // --- END REAL QUERY ---
        });
    }
});
