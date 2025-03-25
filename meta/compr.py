from pathlib import Path
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import difflib
import os
from typing import List, Dict, Tuple
import json
from datetime import datetime
import re
from lxml import etree
import json

import pandas as pd

nt_stubchapters = ["matthew", "mark", "luke", "john", "acts", "romans", "1_corinthians", "2_corinthians", "galatians", "ephesians", "philippians", "colossians", "1_thessalonians", "2_thessalonians", "1_timothy", "2_timothy", "titus", "philemon", "hebrews", "james", "1_peter", "2_peter", "1_john", "2_john", "3_john", "jude", "revelation"]

def element_to_dict(element):
    """Convert an lxml Element to a dictionary that can be JSON serialized"""
    result = {}
    
    if element.attrib:
        result['@attributes'] = dict(element.attrib)
    
    if element.text and element.text.strip():
        result['#text'] = element.text.strip()
    
    children = {}
    for child in element:
        if len(child) == 0:
            if child.text and child.text.strip():
                children[child.tag] = child.text.strip()
        else:
            children[child.tag] = element_to_dict(child)
    
    if children:
        result.update(children)
    
    return result

def extract_text_and_number(text):
    """
    Extract text and number from a string containing letters/spaces followed by a number.
    
    Args:
        text (str): Input string containing text and a number
        
    Returns:
        tuple: (text_part, number) or None if no valid pattern found
    """
    pattern = r'^([a-zA-Z\s\d]+)\s+(\d+)$'
    match = re.match(pattern, text.strip())
    return (match.group(1).strip(), int(match.group(2))) if match else None

def proiel_to_biblehub_chaps(text):
    current_book, chapter = extract_text_and_number(text)
    return f"{chapter}_{current_book.lower()}" if current_book is not None else None

class BibleSourceParser:
    def __init__(self):
        self.xml_parser = etree.XMLParser(resolve_entities=False, no_network=True)
        
    def parse_xml_source_proiel(self, xml_path: str, save_result= False) -> Dict[str, List[Dict]]:
        """Parse XML source from PROIEL project"""
        parser = self.xml_parser
        tree = etree.parse(xml_path, parser=parser)
        root = tree.getroot()
        
        result = {}
        bad_result = {}
        df_result = []
        current_book = None
        
        # Use lxml's faster XPath expressions
        divs = root.xpath(".//div")
        ####attrdict = {}
        
        for d in divs:
            current_book, chapter = extract_text_and_number(d.find("title").text)
            result[f"{current_book}_{chapter}"] = []
            print(f"{current_book} {chapter}")
            
            sent_idx = 0
            sentences = d.xpath('.//sentence')
            for sentence in sentences:
                sentence_tokens = []
                word_idx = 0
                
                tokens = sentence.xpath('token')
                for token in tokens:
                    cittpartemtytokenswtf = token.attrib.get('citation-part', '')
                    
                    if not cittpartemtytokenswtf:
                        if f"{current_book}_{chapter}" not in bad_result:
                            bad_result[f"{current_book}_{chapter}"] = []
                        bad_result[f"{current_book}_{chapter}"].append(element_to_dict(token))
                        continue
                    #####for attr in token.attrib:
                        ####attrdict[attr] = f"token.attrib.get('{attr}', ''),"
                    xdata = {
######## text is inside form attribute(!)                        'text': token.text.strip(),
                        'verse': token.attrib['citation-part'].split(".")[-1],
                        'word': word_idx,
                        'id' : token.attrib.get('id', ''),
                        'form' : token.attrib.get('form', ''),
                        'citation-part' : token.attrib.get('citation-part', ''),
                        'lemma' : token.attrib.get('lemma', ''),
                        'part-of-speech' : token.attrib.get('part-of-speech', ''),
                        'morphology' : token.attrib.get('morphology', ''),
                        'head-id' : token.attrib.get('head-id', ''),
                        'relation' : token.attrib.get('relation', ''),
                        'presentation-after' : token.attrib.get('presentation-after', ''),
                        'information-status' : token.attrib.get('information-status', ''),
                        'empty-token-sort' : token.attrib.get('empty-token-sort', ''),
                        'antecedent-id' : token.attrib.get('antecedent-id', ''),
                        'presentation-before' : token.attrib.get('presentation-before', ''),
                        'contrast-group' : token.attrib.get('contrast-group', ''),
                        ####"attrs": dict(token.attrib)
                    }
                    sentence_tokens.append(xdata)
                    xdata['book'] = current_book
                    xdata['chapter'] = chapter
                    df_result.append(xdata)
                    word_idx += 1
                
                result[f"{current_book}_{chapter}"].append(sentence_tokens)
                sent_idx += 1
            
        ####print(attrdict)
        if(save_result):
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_badparses.txt"
            with open(filename, "w") as file:
                json.dump(bad_result, file, indent=2)
            dbname = f"{timestamp}_el_proiel_el.csv"
                # Create DataFrame and write to CSV
            df = pd.DataFrame(df_result)
            
            # Ensure output directory exists
            Path(dbname).parent.mkdir(parents=True, exist_ok=True)
            
            # Write to CSV with proper formatting
            df.to_csv(
                dbname,
                index=False,
                encoding='utf-8',
                quoting=1, 
                escapechar='\\'
            )
        return result

def str_getfrom_token_first(s1: str, tok: str):
    if not tok: return str
    pos = s1.find(tok)
    return s1[pos:] if pos >= 0 else s1

class BibleHTMLParser:
    def __init__(self):
        pass
    
    def parse_html_folder_biblehub(self, folder_path: str, book_filter: List[str]= None, save_result=False) -> Dict[str, List[List[str]]]:
        """Parse HTML files from BibleHub"""
        result = {}
        sentence_tokens = []
        df_result = []
        iterator_folders = []
        if book_filter is None:
            iterator_folders = os.listdir(folder_path)
        else:
            #if any(book.lower() in folder.lower() for book in book_filter)
            #dircont =
            iterator_folders = [n.lower() for n in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, n))
                       and n.lower() in book_filter]
            #for book in book_filter:
            #    if book.lower()  in dircont: iterator_folders.append(book)
        urls_greek = {}
        for fold in iterator_folders:
            for filename in os.listdir(folder_path.strip(os.path.sep)+os.path.sep+fold):
                if filename.endswith('.htm') or filename.endswith('.html'):
                    chapter = os.path.splitext(filename)[0]
                    current_book = fold
                    result[f"{current_book}_{chapter}"] = []
                    print(f"{current_book} {chapter}")
                    soup = BeautifulSoup(open(os.path.join(folder_path, fold, filename)), 'html.parser')
                    
                    verses = []
                    #greek_spans = soup.find_all('span', class_='greek')
                    table_spans = soup.find_all('table', class_='tablefloat')
                    curr_verse = 0
                    strong_num=-1
                    strong_title = ''
                    strong_en_title = ''
                    translit=''
                    translit_title=''
                    form = ''
                    form_en = ''
                    curr_node = None
                    word_idx = 0
                    for table in table_spans:
                        #verse number?
                        curr_node = table.find("span", class_='reftop3')
                        if curr_node is not None:
                            # nbsp;
                            curr_verse = curr_node.text.strip("\xa0")
                            word_idx = 0

                        #strongs title?
                        curr_node = table.find("span", class_='pos')
                        if curr_node is not None:
                            curr_node = curr_node.find('a')
                            if curr_node is not None:
                                strong_num = int(curr_node.text)
                                strong_title = curr_node.text + str_getfrom_token_first(curr_node.attrs.get('title', ''), ':')
                                attrb = curr_node.attrs.get('href', '')
                                if(attrb != ''):
                                    if(attrb.startswith('/greek')):
                                        urls_greek[attrb]=f"curl -O https://www.biblehub.com{attrb}"
                                        
                        #englishmans concordance
                        curr_node = table.find("span", class_='strongsnt2')
                        if curr_node is not None:
                            curr_node = curr_node.find('a')
                            if curr_node is not None:
                                strong_en_title = curr_node.text
                                attrb = curr_node.attrs.get('href', '')
                                if(attrb != ''):
                                    if(attrb.startswith('/greek')):
                                        urls_greek[attrb]=f"curl -O https://www.biblehub.com{attrb}"
                            
                        #translit
                        curr_node = table.find("span", class_='translit')
                        if curr_node is not None:
                            curr_node = curr_node.find('a')
                            if curr_node is not None:
                                attrb = curr_node.attrs.get('href', '')
                                if(attrb != ''):
                                    if(attrb.startswith('/greek')):
                                        urls_greek[attrb]=f"curl -O https://www.biblehub.com{attrb}"
                                translit_title = curr_node.attrs.get('title', '').replace("\xa0", ' ')
                                translit = curr_node.text.replace("\xa0", ' ')
                        
                        #greek text
                        curr_node = table.find("span", class_='greek')
                        if curr_node is not None:
                            form = curr_node.text.replace("\xa0", ' ')
                        
                        #en text
                        curr_node = table.find("span", class_='eng')
                        if curr_node is not None:
                            form_en = curr_node.text.replace("\xa0", ' ')
                                    
                        xdata = {
######## text is inside form attribute(!)                        'text': token.text.strip(),
                        'verse': curr_verse,
                        'word': word_idx,
                        #'id' : token.attrib.get('id', ''),
                        'form' : form,
                        'form_en': form_en,
                        #'citation-part' : token.attrib.get('citation-part', ''),
                        #'lemma' : token.attrib.get('lemma', ''),
                        #'part-of-speech' : token.attrib.get('part-of-speech', ''),
                        #'morphology' : token.attrib.get('morphology', ''),
                        #'head-id' : token.attrib.get('head-id', ''),
                        #'relation' : token.attrib.get('relation', ''),
                        #'presentation-after' : token.attrib.get('presentation-after', ''),
                        #'information-status' : token.attrib.get('information-status', ''),
                        #'empty-token-sort' : token.attrib.get('empty-token-sort', ''),
                        #'antecedent-id' : token.attrib.get('antecedent-id', ''),
                        #'presentation-before' : token.attrib.get('presentation-before', ''),
                        #'contrast-group' : token.attrib.get('contrast-group', ''),
                        ####"attrs": dict(token.attrib)
                        'strong_num': strong_num,
                        'strong_title' : strong_title,
                        'strong_en_title' : strong_en_title,
                        'translit': translit,
                        'translit_title': translit_title
                    }
                        sentence_tokens.append(xdata)
                        xdata['book'] = current_book
                        xdata['chapter'] = chapter
                        df_result.append(xdata)
                        word_idx += 1
                    
#                    result[book_chapter] = verses
                    result[f"{current_book}_{chapter}"].append(sentence_tokens)
        if(save_result):
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_dload.sh"
            with open(filename, "w") as file:
                for k, v in urls_greek.items():
                    file.write(f"{v}\n")
            dbname = f"{timestamp}_biblehub_el_en_direct.csv"
                # Create DataFrame and write to CSV
            df = pd.DataFrame(df_result)
            
            # Ensure output directory exists
            Path(dbname).parent.mkdir(parents=True, exist_ok=True)
            
            # Write to CSV with proper formatting
            df.to_csv(
                dbname,
                index=False,
                encoding='utf-8',
                quoting=1, 
                escapechar='\\'
            )                    
        return result

class BibleComparator:
    def __init__(self):
        self.parser_xml = BibleSourceParser()
        self.parser_html = BibleHTMLParser()
        
    def compare_verses(self, xml_source: Dict[str, List[List[Dict]]], 
                      html_source: Dict[str, List[List[str]]]) -> List[Tuple]:
        """Compare verses and generate comparison tuples"""
        comparisons = []
        
        for book_chapter in xml_source.keys():
            if book_chapter in html_source:
                xml_verses = xml_source[book_chapter]
                html_verses = html_source[book_chapter]
                
                max_verses = max(len(xml_verses), len(html_verses))
                
                for verse_num in range(max_verses):
                    xml_verse = xml_verses[verse_num] if verse_num < len(xml_verses) else None
                    html_verse = html_verses[verse_num] if verse_num < len(html_verses) else None
                    
                    comparisons.append((book_chapter, verse_num + 1, xml_verse, html_verse))
        
        return comparisons
    
    def generate_html_report(self, comparisons: List[Tuple], 
                           output_path: str = 'comparison_report.html'):
        """Generate HTML report with interlinear comparison"""
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bible Greek Sources Comparison</title>
    <style>
        .container { margin: 20px; font-family: Arial, sans-serif; }
        .verse-comparison { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        .verse-comparison td { padding: 8px; border: 1px solid #ddd; }
        .source-header { background-color: #f5f5f5; }
        .difference { background-color: #ffebee; }
        .addition { background-color: #e8f5e9; }
        .deletion { background-color: #ffebee; }
        .nav-buttons { margin-top: 10px; }
        .nav-button { padding: 5px 10px; margin-right: 5px; }
    </style>
</head>
<body>
    <div class="container">
        {}
    </div>
</body>
</html>
"""
        
        report_content = []
        
        for book_chapter, verse_num, xml_verse, html_verse in comparisons:
            report_content.append(f'<h2>{book_chapter}, Verse {verse_num}</h2>')
            
            if xml_verse and html_verse:
                # Compare verses
                diff = difflib.SequenceMatcher(None, 
                                             ' '.join(t['form'] for t in xml_verse),
                                             ' '.join(html_verse))
                
                # Generate comparison table
                table_rows = ['<table class="verse-comparison">']
                table_rows.append('<tr><th>PROIEL Source</th><th>BibleHub Source</th></tr>')
                
                # Get aligned sequences
                opcodes = diff.get_opcodes()
                for opcode in opcodes:
                    if opcode[0] == 'equal':
                        xml_words = ' '.join(t['form'] for t in xml_verse[opcode[1]:opcode[2]])
                        html_words = ' '.join(html_verse[opcode[3]:opcode[4]])
                        table_rows.append(f'<tr><td>{xml_words}</td><td>{html_words}</td></tr>')
                    elif opcode[0] == 'replace':
                        xml_words = ' '.join(t['form'] for t in xml_verse[opcode[1]:opcode[2]])
                        html_words = ' '.join(html_verse[opcode[3]:opcode[4]])
                        table_rows.append(f'<tr><td class="difference">{xml_words}</td><td class="difference">{html_words}</td></tr>')
                    elif opcode[0] == 'delete':
                        xml_words = ' '.join(t['form'] for t in xml_verse[opcode[1]:opcode[2]])
                        table_rows.append(f'<tr><td class="deletion">{xml_words}</td><td></td></tr>')
                    elif opcode[0] == 'insert':
                        html_words = ' '.join(html_verse[opcode[3]:opcode[4]])
                        table_rows.append(f'<tr><td></td><td class="addition">{html_words}</td></tr>')
                
                table_rows.append('</table>')
                report_content.append('\n'.join(table_rows))
            
            # Add navigation buttons
            report_content.append("""
                <div class="nav-buttons">
                    <button onclick="window.location.href='#'" class="nav-button">Top</button>
                    <button onclick="history.back()" class="nav-button">Previous</button>
                    <button onclick="history.forward()" class="nav-button">Next</button>
                </div>
            """)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_template.format('\n'.join(report_content)))
            
comparator = BibleComparator()
html_sources = comparator.parser_html.parse_html_folder_biblehub('../../00rebordn2/', nt_stubchapters, True)
#proiel_to_biblehub_chaps(nt_stubchapters))
xml_sources = comparator.parser_xml.parse_xml_source_proiel('./greek-nt.xml', False)#True)

comparisons = comparator.compare_verses(xml_sources, html_sources)
comparator.generate_html_report(comparisons)
