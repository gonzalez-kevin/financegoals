// Load the JSON file and render the dashboard
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const metrics = data.metrics_data;
        const graphs = data.graph_data;

        // Display metrics
        const metricsDiv = document.getElementById('metrics');
        for (const category in metrics) {
            const m = metrics[category];
            const div = document.createElement('div');
            div.className = 'metric';
            div.innerHTML = `
                <h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                <p>Latest Balance: $${m.latest_balance}</p>
                <p>Goal: $${m.goal}</p>
                <p>Days Left: ${m.days_left}</p>
                <p>Target Date: ${m.target_date}</p>
            `;
            metricsDiv.appendChild(div);
        }

        // Create charts
        const investmentsLabels = graphs.investments_graph.map(item => item.date);
        const investmentsData = graphs.investments_graph.map(item => item.balance);

        const savingsLabels = graphs.savings_graph.map(item => item.date);
        const savingsData = graphs.savings_graph.map(item => item.balance);

        new Chart(document.getElementById('investmentsChart'), {
            type: 'line',
            data: {
                labels: investmentsLabels,
                datasets: [{
                    label: 'Investments Balance',
                    data: investmentsData,
                    borderColor: 'blue',
                    fill: false
                }]
            }
        });

        new Chart(document.getElementById('savingsChart'), {
            type: 'line',
            data: {
                labels: savingsLabels,
                datasets: [{
                    label: 'Savings Balance',
                    data: savingsData,
                    borderColor: 'green',
                    fill: false
                }]
            }
        });
    })
    .catch(err => console.error('Error loading JSON:', err));