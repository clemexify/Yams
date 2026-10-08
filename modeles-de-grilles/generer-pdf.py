"""Fabrique les six PDF de grilles à imprimer et leurs miniatures, à partir de modele.html.

Chrome imprime la page (texte réel, PDF balisé, langue fr) mais ne sait écrire que le
titre. Le sujet, les mots-clés et l'auteur sont ajoutés ensuite avec pypdf, dans le
dictionnaire Info et dans le bloc XMP, que les moteurs et les visionneuses lisent.

Sortie dans ../grilles/ : un PDF et une miniature PNG (même nom) par variante.
Les sources de ce dossier ne sont pas déployées (voir .github/workflows/deploy.yml).

Usage : python generer-pdf.py            (les six variantes)
        python generer-pdf.py 5 1        (5 colonnes avec paire et brelan)
Dépendance : pip install pypdf
"""
import os
import subprocess
import sys

from pypdf import PdfWriter
from pypdf.generic import BooleanObject, DictionaryObject, NameObject
from pypdf.xmp import XmpInformation

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, '..', 'grilles')
AUTEUR = 'Mon Yams (monyams.app)'

VARIANTES = {
    1: {'slug': '1-colonne', 'lib': '1 colonne', 'nb': 'douze',
        'cols': 'la grille classique', 'mots': ['grille yams 1 colonne', 'grille yams classique',
                                                'grille yams simple']},
    3: {'slug': '3-colonnes', 'lib': '3 colonnes', 'nb': 'huit',
        'cols': 'Normale, Descente, Montée', 'mots': ['grille yams 3 colonnes', 'yams 3 colonnes',
                                                       'yams descendante montante']},
    5: {'slug': '5-colonnes', 'lib': '5 colonnes', 'nb': 'six',
        'cols': 'Normale, Descente, Montée, Sèche, Annoncée',
        'mots': ['grille yams 5 colonnes', 'yams 5 colonnes', 'yam bloqué', 'yams sèche annoncée']},
}
MOTS = ['grille yams', 'grille de yams', 'grille yams à imprimer', 'grille yams pdf',
        'feuille de yams', 'feuille de score yams', 'feuille yams pdf', 'yams à imprimer',
        'yahtzee', 'Mon Yams']


def nom_fichier(cols, brelans):
    v = VARIANTES[cols]
    return 'grille-yams-' + v['slug'] + ('-paire-brelan' if brelans else '') + '-a-imprimer'


def metadonnees(cols, brelans):
    v = VARIANTES[cols]
    avec = ' avec paire et brelan' if brelans else ''
    titre = 'Grille de yams ' + v['lib'] + avec + ' à imprimer (PDF A4 gratuit) | Mon Yams'
    sujet = ('Grille de yams à imprimer gratuitement : ' + v['nb'] + ' feuilles de score '
             + v['lib'] + ' (' + v['cols'] + ')' + avec + ' sur une page A4, barème inclus. '
             'Joue aussi en ligne sur monyams.app.')
    mots = MOTS + v['mots'] + (['yams paire brelan', 'grille yams avec brelan'] if brelans else [])
    return titre, sujet, mots


def generer(cols, brelans):
    os.makedirs(SORTIE, exist_ok=True)
    nom = nom_fichier(cols, brelans)
    pdf = os.path.join(SORTIE, nom + '.pdf')
    png = os.path.join(SORTIE, nom + '.png')
    url = 'file://' + os.path.join(ICI, 'modele.html') + '?cols=%d&brelans=%d' % (cols, brelans)

    subprocess.run([CHROME, '--headless', '--disable-gpu', '--no-pdf-header-footer',
                    '--print-to-pdf=' + pdf, url], check=True, stderr=subprocess.DEVNULL)
    # Miniature affichée sur /grille-yams : la page A4 entière, au double de sa taille
    # d'affichage pour rester nette sur les écrans haute densité.
    subprocess.run([CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
                    '--force-device-scale-factor=1', '--window-size=794,1123',
                    '--screenshot=' + png, url], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    titre, sujet, mots = metadonnees(cols, brelans)
    # clone_from garde l'arbre de structure et la langue posés par Chrome
    w = PdfWriter(clone_from=pdf)
    w.add_metadata({
        '/Title': titre,
        '/Subject': sujet,
        '/Keywords': ', '.join(mots),
        '/Author': AUTEUR,
        '/Creator': 'monyams.app',
        '/Producer': 'monyams.app',
    })
    xmp = XmpInformation.create()
    xmp.dc_title = {'x-default': titre}
    xmp.dc_description = {'x-default': sujet}
    xmp.dc_subject = mots
    xmp.dc_creator = [AUTEUR]
    xmp.dc_language = ['fr']
    xmp.pdf_keywords = ', '.join(mots)
    xmp.pdf_producer = 'monyams.app'
    xmp.xmp_creator_tool = 'monyams.app'
    w.xmp_metadata = xmp
    # Les visionneuses affichent le titre plutôt que le nom du fichier
    w._root_object[NameObject('/ViewerPreferences')] = DictionaryObject(
        {NameObject('/DisplayDocTitle'): BooleanObject(True)})
    with open(pdf, 'wb') as f:
        w.write(f)
    print(os.path.relpath(pdf, ICI))


if __name__ == '__main__':
    if len(sys.argv) == 3:
        generer(int(sys.argv[1]), sys.argv[2] == '1')
    else:
        for c in (1, 3, 5):
            for b in (False, True):
                generer(c, b)
