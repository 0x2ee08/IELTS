import requests

search_word = 'led'

data = {
    'filter_search': search_word,
}

def extract_lines(x, y, num_following_lines=1):
    lines = x.splitlines()  # Split the string into lines
    result = []
    levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

    for i, line in enumerate(lines):
        if y in line:
            # Check the current line and the next 'num_following_lines' lines
            for j in range(num_following_lines + 1):
                if i + j < len(lines):
                    next_line = lines[i + j]
                    # Append only lines that contain a level keyword
                    if any(level in next_line for level in levels):
                        result.append(next_line)

    return result

def find_levels(test_lines):
    levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    found_levels = []

    for line in test_lines:
        for level in levels:
            if level in line:
                found_levels.append(level)
    
    return found_levels

def get_min_max_level(levels):
    # Sort levels according to their order in the CEFR scale
    cefr_order = ["A1", "A2", "B1", "B2", "C1", "C2"]
    sorted_levels = sorted(levels, key=lambda x: cefr_order.index(x))
    
    if sorted_levels:
        min_level = sorted_levels[0]
        max_level = sorted_levels[-1]
        return min_level, max_level
    return None, None

def get_median_level(min_level, max_level):
    cefr_order = ["A1", "A2", "B1", "B2", "C1", "C2"]
    if min_level and max_level:
        min_index = cefr_order.index(min_level)
        max_index = cefr_order.index(max_level)
        
        if min_index == max_index:
            return min_level  # If min and max are the same, return the single level
        
        median_index = (min_index + max_index) // 2
        return cefr_order[median_index]
    
    return None

response = requests.post('https://www.englishprofile.org/wordlists/evp', data=data)

extracted_lines = extract_lines(response.text, "</td>")
found_levels = find_levels(extracted_lines)

min_level, max_level = get_min_max_level(found_levels)
median_level = get_median_level(min_level, max_level)

print("Found levels:", found_levels)
print("Minimum level:", min_level)
print("Maximum level:", max_level)
print("Median level:", median_level)
