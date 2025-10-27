document.addEventListener('DOMContentLoaded', () => {

    // --- COMMON CODE (Runs on all pages) ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    /**
     * Populates a <select> element with batch years.
     * This version is safer and won't fail if the element is empty.
     */
    function populateBatchYears(selectElement) {
        if (!selectElement) return;
        
        // Save the placeholder text (e.g., "Select your batch year")
        const placeholderText = selectElement.options[0] ? selectElement.options[0].textContent : "Select a Year";
        const placeholderValue = selectElement.options[0] ? selectElement.options[0].value : "";

        // Clear ALL existing options
        selectElement.innerHTML = '';

        // Re-create the placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = placeholderValue;
        placeholderOption.textContent = placeholderText;
        selectElement.appendChild(placeholderOption);
        
        // Add the year options
        const currentYear = new Date().getFullYear();
        const startYear = 1986; // Starts from 1986

        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            selectElement.appendChild(option);
        }
    }

    // --- SUPABASE CLIENT INITIALIZATION ---
    // We initialize this *after* the page loads and inside a try...catch
    
    let _supabase = null;
    try {
        // Check if the Supabase library (supabase-js) loaded correctly
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase library (supabase-js) is not loaded. Check script tag.');
        }
        
        // 1. --- PASTE YOUR SUPABASE URL AND KEY HERE ---
       // const SUPABASE_URL = 'postgresql://postgres:Assam@123@db.pyiykmalduhdjyfhxmtn.supabase.co:5432/postgres'; 
       // const SUPABASE_ANON_KEY =eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aXlrbWFsZHVoZGp5Zmh4bXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzY5ODYsImV4cCI6MjA3NzE1Mjk4Nn0.WoHb3WCzOhAP-aY5KFy4Zf0VB9nlRT5nsAT-43nODDY; 
        // ------------------------------------------------

        // Check if user forgot to add keys
        if (!SUPABASE_URL.includes('http') || !SUPABASE_ANON_KEY.includes('ey')) {
             throw new Error('Supabase URL or Key is missing. Please paste them into script.js.');
        }

        const { createClient } = supabase;
        _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');

    } catch (error) {
        console.error('Failed to initialize Supabase:', error.message);
        // We'll show an error on the relevant pages
    }


    // --- PAGE-SPECIFIC CODE for add.html ---
    const alumniForm = document.getElementById('alumni-form');
    if (alumniForm) {
        // This will run NOW, regardless of whether Supabase loaded
        populateBatchYears(document.getElementById('batch')); 
        
        const formMessage = document.getElementById('form-message');
        const submitButton = alumniForm.querySelector('button[type="submit"]');

        // Check if Supabase failed to load
        if (!_supabase) {
             formMessage.textContent = 'Error: Database connection failed. Cannot submit form.';
             formMessage.className = 'message error';
             submitButton.disabled = true; // Disable the button
             submitButton.style.backgroundColor = '#aaa';
        } else {
            // Supabase is OK, add the submit listener
            alumniForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                formMessage.textContent = "Submitting...";
                formMessage.className = 'message';
                submitButton.disabled = true;

                const formData = {
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    branch: document.getElementById('branch').value,
                    workplace: document.getElementById('workplace').value,
                    batch: document.getElementById('batch').value 
                };
                
                const { data, error } = await _supabase
                    .from('alumni') // Your table name
                    .insert([formData]);

                if (error) {
                    console.error('Error submitting data:', error);
                    formMessage.textContent = `Error: ${error.message}`;
                    formMessage.className = 'message error';
                    submitButton.disabled = false;
                } else {
                    console.log('Data submitted:', data);
                    formMessage.textContent = "Your information has been submitted successfully!";
                    formMessage.className = 'message success';
                    alumniForm.reset();
                    submitButton.disabled = false;
                }
            });
        }
    }

    // --- PAGE-SPECIFIC CODE for view.html ---
    const loadDataBtn = document.getElementById('load-data-btn');
    if (loadDataBtn) {
        // This will run NOW, regardless of whether Supabase loaded
        populateBatchYears(document.getElementById('view-batch')); 
        
        const alumniListDiv = document.getElementById('alumni-list');
        const viewMessage = document.getElementById('view-message');

        // Check if Supabase failed
        if (!_supabase) {
            viewMessage.textContent = 'Error: Database connection failed. Cannot load data.';
            viewMessage.style.display = 'block';
            loadDataBtn.disabled = true; // Disable the button
            loadDataBtn.style.backgroundColor = '#aaa';
        } else {
            // Supabase is OK, add the click listener
            loadDataBtn.addEventListener('click', async () => {
                const selectedBatch = document.getElementById('view-batch').value;
                alumniListDiv.innerHTML = ''; // Clear results
                viewMessage.style.display = 'block';

                if (!selectedBatch) {
                    viewMessage.textContent = "Please select a batch year to view.";
                    return;
                }

                viewMessage.textContent = `Loading data for Batch ${selectedBatch}...`;

                const { data, error } = await _supabase
                    .from('alumni') // Your table name
                    .select('*') 
                    .eq('batch', selectedBatch); 

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
            });
        }
    }
});




