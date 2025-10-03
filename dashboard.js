// Load and display financial data
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Update metrics
        updateMetrics(data.metrics);
        
        // Create charts
        createLineChart('investmentsChart', data.graphs.investments_graph, 'Investments', '#667eea');
        createLineChart('savingsChart', data.graphs.savings_graph, 'Savings', '#10b981');
        
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Could not load data.json. Make sure the file is in the same directory as your HTML file.');
    }
}

function updateMetrics(metrics) {
    // Investments metrics
    const investmentsPercent = (metrics.investments.latest_balance / metrics.investments.goal * 100).toFixed(1);
    const investmentsRemaining = metrics.investments.goal - metrics.investments.latest_balance;
    document.getElementById('investmentsPercentage').textContent = `${investmentsPercent}%`;
    document.getElementById('investmentsAmount').textContent = 
        `${metrics.investments.latest_balance.toLocaleString()} / ${metrics.investments.goal.toLocaleString()}`;
    document.getElementById('investmentsRemaining').textContent = 
        `${investmentsRemaining.toLocaleString()} remaining`;
    document.getElementById('investmentsDays').textContent = 
        `${metrics.investments.days_left} days remaining`;
    
    // Savings metrics
    const savingsPercent = (metrics.savings.latest_balance / metrics.savings.goal * 100).toFixed(1);
    const savingsRemaining = metrics.savings.goal - metrics.savings.latest_balance;
    document.getElementById('savingsPercentage').textContent = `${savingsPercent}%`;
    document.getElementById('savingsAmount').textContent = 
        `${metrics.savings.latest_balance.toLocaleString()} / ${metrics.savings.goal.toLocaleString()}`;
    document.getElementById('savingsRemaining').textContent = 
        `${savingsRemaining.toLocaleString()} remaining`;
    document.getElementById('savingsDays').textContent = 
        `${metrics.savings.days_left} days remaining`;
    
    // Create progress circles
    createProgressCircle('investmentsProgress', investmentsPercent, '#667eea');
    createProgressCircle('savingsProgress', savingsPercent, '#10b981');
}

function createProgressCircle(canvasId, percentage, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [color, '#e0e0e0'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
}

function createLineChart(canvasId, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Extract dates and balances
    const dates = data.map(item => item['As Of Date']);
    const balances = data.map(item => item.Balance);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: label,
                data: balances,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Load data when page loads
window.addEventListener('DOMContentLoaded', loadData);