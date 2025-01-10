
// Process the social media data
const processData = (data) => {
    const platformData = {};
    data.forEach(row => {
        const platform = row.Platform;
        if (!platformData[platform]) {
            platformData[platform] = {
                likes: 0,
                comments: 0,
                shared: 0,
                count: 0,
                totalEngagement: 0
            };
        }
        platformData[platform].likes += parseInt(row.Likes) || 0;
        platformData[platform].comments += parseInt(row.comments) || 0;
        platformData[platform].shared += parseInt(row.shared) || 0;
        platformData[platform].count++;
        platformData[platform].totalEngagement += 
            (parseInt(row.Likes) || 0) + 
            (parseInt(row.comments) || 0) + 
            (parseInt(row.shared) || 0);
    });

    const contentData = {};
    data.forEach(row => {
        const postType = row.Post_Type;
        if (!contentData[postType]) {
            contentData[postType] = {
                count: 0,
                engagement: 0
            };
        }
        contentData[postType].count++;
        contentData[postType].engagement += 
            (parseInt(row.Likes) || 0) + 
            (parseInt(row.comments) || 0) + 
            (parseInt(row.shared) || 0);
    });

    return { platformData, contentData };
};

// Create charts
const createCharts = (data) => {
    const { platformData, contentData } = processData(data);

    // Platform Engagement Chart
    new Chart(document.getElementById('platformChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(platformData),
            datasets: [{
                label: 'Average Engagement per Post',
                data: Object.values(platformData).map(p => 
                    (p.totalEngagement / p.count).toFixed(2)
                ),
                backgroundColor: '#6C63FF',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#E4E6F0'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#E4E6F0'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#E4E6F0'
                    }
                }
            }
        }
    });

    // Content Type Performance Chart
    new Chart(document.getElementById('contentChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(contentData),
            datasets: [{
                data: Object.values(contentData).map(c => 
                    (c.engagement / c.count).toFixed(2)
                ),
                backgroundColor: [
                    '#6C63FF',
                    '#4CAF50',
                    '#F44336',
                    '#FFC107',
                    '#2196F3'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#E4E6F0'
                    }
                }
            }
        }
    });

    // Engagement Metrics Chart
    new Chart(document.getElementById('engagementChart'), {
        type: 'line',
        data: {
            labels: Object.keys(platformData),
            datasets: [
                {
                    label: 'Likes',
                    data: Object.values(platformData).map(p => 
                        (p.likes / p.count).toFixed(2)
                    ),
                    borderColor: '#6C63FF',
                    tension: 0.4
                },
                {
                    label: 'Comments',
                    data: Object.values(platformData).map(p => 
                        (p.comments / p.count).toFixed(2)
                    ),
                    borderColor: '#4CAF50',
                    tension: 0.4
                },
                {
                    label: 'Shares',
                    data: Object.values(platformData).map(p => 
                        (p.shared / p.count).toFixed(2)
                    ),
                    borderColor: '#F44336',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#E4E6F0'
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#E4E6F0'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#E4E6F0'
                    }
                }
            }
        }
    });

    // Platform Distribution Chart
    new Chart(document.getElementById('distributionChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(platformData),
            datasets: [{
                data: Object.values(platformData).map(p => p.count),
                backgroundColor: [
                    '#6C63FF',
                    '#4CAF50',
                    '#F44336',
                    '#FFC107',
                    '#2196F3'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#E4E6F0'
                    }
                }
            }
        }
    });
};

// Parse CSV data
const parseCSVData = (csvString) => {
    const rows = csvString.trim().split('\n');
    const headers = rows[0].split(',');
    
    return rows.slice(1).map(row => {
        const values = row.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index];
        });
        return obj;
    });
};

// Fetch CSV file from the given path
const fetchCSVFile = (path) => {
    fetch(path)
        .then(response => response.text())
        .then(csvData => {
            const socialMediaData = parseCSVData(csvData);
            createCharts(socialMediaData);
        })
        .catch(error => console.error("Error fetching CSV file:", error));
};

// Provide the path of the CSV file
const filePath = './social_media_analysis.csv'; // Ensure your CSV file is in the same folder

// Call the function to fetch and process the file
fetchCSVFile(filePath);
