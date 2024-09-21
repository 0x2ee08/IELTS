import matplotlib.pyplot as plt
import numpy as np

# Data from the JSON structure
years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]
country_a = [500, 550, 600, 650, 700, 800, 750, 900, 850, 950, 1000]
country_b = [450, 400, 500, 550, 600, 580, 620, 700, 680, 750, 720]
country_c = [300, 350, 400, 380, 420, 430, 440, 480, 500, 520, 600]

# Create the bar chart
x = np.arange(len(years))
width = 0.2  # Width of the bars

fig, ax = plt.subplots(figsize=(10, 6))

# Bars for each country
rects1 = ax.bar(x - width, country_a, width, label='Country A', color='blue')
rects2 = ax.bar(x, country_b, width, label='Country B', color='green')
rects3 = ax.bar(x + width, country_c, width, label='Country C', color='red')

# Labels and title
ax.set_xlabel('Year')
ax.set_ylabel('Value')
ax.set_title('Data by Country (2010-2020)')
ax.set_xticks(x)
ax.set_xticklabels(years)
ax.legend()

plt.tight_layout()
plt.show()
