from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import pandas as pd
import time

def scrape_articles():
    data = []  # Initialize data list here to ensure it's available for DataFrame creation

    driver = webdriver.Chrome()  # Assume Chrome WebDriver is being used
    wait = WebDriverWait(driver, 10)  # Initialize WebDriverWait

    try:
        query = "athletic/football/premier-league/standings/"
        url = f"https://www.google.com/search?q={query}&tbm=nws"
        driver.get(url)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
        time.sleep(3)

        body = driver.find_element(By.TAG_NAME, 'body')
        body.send_keys(Keys.END)
        time.sleep(2)

        single_article = '#rso > div > div > div:nth-child(1)'
        article_element = driver.find_element(By.CSS_SELECTOR, single_article)

        anchor_element = article_element.find_element(By.XPATH, ".//a[@jsname]")
        article_link = anchor_element.get_attribute("href")

        # Open new window and switch to it
        driver.execute_script("window.open(arguments[0]);", article_link)
        driver.switch_to.window(driver.window_handles[-1])
        wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, 'body')))

        # Click on the specific element in the new window
        specific_element_xpath = "//*[@id='__next']/div/div[1]/header/nav/div/div[1]/div/div/div[4]/div/div[2]/div[3]/a"
        specific_element = wait.until(EC.element_to_be_clickable((By.XPATH, specific_element_xpath)))
        specific_element.click()  # Perform click

        table = driver.find_element(By.CLASS_NAME, 'table-container')
        rows = table.find_elements(By.TAG_NAME, 'tr')
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, 'td')
            cols = [elem.text for elem in cols]
            data.append(cols)

    except NoSuchElementException as e:
        print(f"No such element error: {str(e)}")
    except TimeoutException as e:
        print(f"Timeout exception: {str(e)}")
    except Exception as e:
        print(f"General error processing articles: {str(e)}")
    finally:
        driver.quit()  # Ensure the driver is quit properly

    if data:
        # Check and print the first row of data to see the number of columns
        print("First row of data:", data[0])
        
    # Determine the correct number of columns from the data and set them
    column_names = ['Column1', 'Column2', 'Column3', 'Column4', 'Column5', 'Column6', 'Column7', 'Column8', 'Column9', 'Column10']  # Adjust based on actual data
    df = pd.DataFrame(data, columns=column_names)
    return df

# Call the function
articles_data = scrape_articles()

if not articles_data.empty:
    articles_data.to_csv('premiere.csv', index=False)
    print("Data saved to CSV successfully.")
else:
    print("No data to save.")
