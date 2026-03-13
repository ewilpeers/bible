#!/bin/bash

# Grāmatu saīsinājumi
books=("Gen" "Exo" "Lev" "Num" "Deu" "Jos" "Jdg" "Rth" "1Sa" "2Sa" "1Ki" "2Ki" "1Ch" "2Ch" "Ezr" "Neh" "Est" "Job" "Psa" "Pro" "Ecc" "Sng" "Isa" "Jer" "Lam" "Eze" "Dan" "Hos" "Joe" "Amo" "Oba" "Jon" "Mic" "Nah" "Hab" "Zep" "Hag" "Zec" "Mal")

# Nodaļu skaits attiecīgajām grāmatām
chaps=(50 40 27 36 34 24 21 4 31 24 22 25 29 36 10 13 10 42 150 31 12 8 66 52 5 48 12 14 3 9 1 4 7 3 3 3 2 14 4)

# Pārbaudām vai masīvu garumi sakrīt (drošībai)
if [ ${#books[@]} -ne ${#chaps[@]} ]; then
    echo "Kļūda: Grāmatu un nodaļu masīvu garumi nesakrīt!"
    exit 1
fi

# Cilpa cauri visām grāmatām
for i in "${!books[@]}"; do
    book=${books[$i]}
    max_chap=${chaps[$i]}
    
    echo "Sāku lejupielādēt grāmatu: $book ($max_chap nodaļas)"
    
    # Cilpa cauri nodaļām (no 1 līdz max_chap)
    for (( c=1; c<=max_chap; c++ )); do
        # Izveidojam URL (mazie burti grāmatas nosaukumam, ja nepieciešams)
        # Lielākā daļa serveru ir case-sensitive, drošības pēc pārvēršam uz mazajiem
        url_book=$(echo "$book" | tr '[:upper:]' '[:lower:]')
        url="https://www.blueletterbible.org/lxx/$url_book/$c/1/ss1/"
        
        # Faila nosaukums: book_chap.html
        filename="${book}_${c}.html"
        
        echo "  Lejupielādēju $filename..."
        
        # Izmantojam curl ar -L (sekot pāradresācijām) un --silent
        # Pievienojam User-Agent, lai serveris nebloķētu skriptu
        curl -L -A "Mozilla/5.0" "$url" -o "$filename"
        
        # Neliela pauze, lai serveris neuzskatītu mūs par uzbrukumu (DoS)
        sleep 0.5
    done
done

echo "Visas nodaļas ir lejupielādētas!"
