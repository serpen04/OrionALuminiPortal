document.addEventListener('DOMContentLoaded', () => {

    // --- COMMON CODE (Runs on all pages) ---
    
    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Function to populate batch year dropdowns
    function populateBatchYears(selectElement) {
        if (!selectElement) return;
        
        const currentYear = new Date().getFullYear();
        const startYear = 1982;
        
        // Clear existing options (except the first "Select..." one)
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
        // Populate the batch dropdown on the 'add' page
        populateBatchYears(document.getElementById('batch'));
        
        const formMessage = document.getElementById('form-message');

        alumniForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value, // <-- NEW EMAIL FIELD
                branch: document.getElementById('branch').value,
                workplace: document.getElementById('workplace').value,
                batch: document.getElementById('batch').value
            };

            // Basic client-side validation
            if (!formData.name || !formData.phone || !formData.email || !formData.branch || !formData.batch) {
                formMessage.textContent = "Please fill in all required fields.";
                formMessage.className = 'message error';
                return;
            }

            // --- BACKEND INTEGRATION POINT ---
            // In a real app, you would send this 'formData' to your server here.
            
            // For now, let's just simulate success for demonstration
            formMessage.textContent = "Your information has been submitted (simulated)! In a real app, it would be saved to a database.";
            formMessage.className = 'message success';
            alumniForm.reset(); // Clear the form
            console.log("Simulated Alumni Data Submitted:", formData);
        });
    }


    // --- PAGE-SPECIFIC CODE for view.html ---

    const loadDataBtn = document.getElementById('load-data-btn');
    if (loadDataBtn) {
        // Populate the batch dropdown on the 'view' page
        const viewBatchSelect = document.getElementById('view-batch');
        populateBatchYears(viewBatchSelect);

        const alumniListDiv = document.getElementById('alumni-list');
        const viewMessage = document.getElementById('view-message');

        loadDataBtn.addEventListener('click', async () => {
            const selectedBatch = viewBatchSelect.value;
            alumniListDiv.innerHTML = ''; // Clear previous results
            viewMessage.textContent = ''; // Clear previous messages
            viewMessage.style.display = 'none';

            if (!selectedBatch) {
                viewMessage.textContent = "Please select a batch year to view.";
                viewMessage.style.display = 'block';
                return;
            }

            // --- BACKEND INTEGRATION POINT ---
            // In a real app, you would fetch data for 'selectedBatch' from your server here.

            // For now, let's simulate some data (with email included)
            const simulatedAlumni = [
                { name: "Alice Johnson", phone: "1112223334", email: "alice.j@google.com", branch: "CSE", workplace: "Google", batch: "2000" },
                { name: "Bob Smith", phone: "2223334445", email: "bob.smith@tesla.com", branch: "ME", workplace: "Tesla", batch: "2000" },
                { name: "Charlie Brown", phone: "3334445556", email: "cbrown@siemens.de", branch: "EE", workplace: "Siemens", batch: "2000" },
                { name: "Diana Prince", phone: "4445556667", email: "d.prince@lnt.com", branch: "CE", workplace: "L&T", batch: "1995" },
                { name: "Ethan Hunt", phone: "5556667778", email: "ehunt@imf.gov", branch: "IE", workplace: "IMF", batch: "1998" }
            ];

            const filteredAlumni = simulatedAlumni.filter(alum => alum.batch === selectedBatch);

            if (filteredAlumni.length === 0) {
                viewMessage.textContent = `No simulated alumni found for Batch ${selectedBatch}.`;
                viewMessage.style.display = 'block';
            } else {
                viewMessage.textContent = `Showing ${filteredAlumni.length} alumni for Batch ${selectedBatch} (simulated data).`;
                viewMessage.style.display = 'block';

                filteredAlumni.forEach(alum => {
                    const card = document.createElement('div');
                    card.className = 'alumni-card';
                    // Updated card HTML to include email
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
});