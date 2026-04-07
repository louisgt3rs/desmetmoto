SET search_path TO public;

ALTER TABLE public.installation_intercoms
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Set slugs
UPDATE public.installation_intercoms SET slug = 'sf2'            WHERE brand = 'Sena'        AND name = 'SF2';
UPDATE public.installation_intercoms SET slug = 'sf4'            WHERE brand = 'Sena'        AND name = 'SF4';
UPDATE public.installation_intercoms SET slug = '50s'            WHERE brand = 'Sena'        AND name = '50S';
UPDATE public.installation_intercoms SET slug = '50r'            WHERE brand = 'Sena'        AND name = '50R';
UPDATE public.installation_intercoms SET slug = '30k'            WHERE brand = 'Sena'        AND name = '30K';
UPDATE public.installation_intercoms SET slug = 'packtalk-slim'  WHERE brand = 'Cardo'       AND name = 'PackTalk Slim';
UPDATE public.installation_intercoms SET slug = 'packtalk-bold'  WHERE brand = 'Cardo'       AND name = 'PackTalk Bold';
UPDATE public.installation_intercoms SET slug = 'packtalk-edge'  WHERE brand = 'Cardo'       AND name = 'PackTalk Edge';
UPDATE public.installation_intercoms SET slug = 'freecom-4-plus' WHERE brand = 'Cardo'       AND name = 'Freecom 4+';
UPDATE public.installation_intercoms SET slug = 'tech-air-comm'  WHERE brand = 'Alpinestars' AND name = 'Tech-Air Comm';

-- Set descriptions
UPDATE public.installation_intercoms SET description = 'Entrée de gamme Sena. Communication Bluetooth jusqu''à 2 motards, portée 900 m, 8h d''autonomie. Profil ultra-fin.' WHERE name = 'SF2';
UPDATE public.installation_intercoms SET description = 'Jusqu''à 4 motards en réseau, portée 1,2 km. Bluetooth 4.1, FM intégré, 10h d''autonomie. Rapport qualité-prix excellent.' WHERE name = 'SF4';
UPDATE public.installation_intercoms SET description = 'Le haut de gamme Sena. Mesh 2.0 universel, 8 riders, 2 km de portée, haut-parleurs Harman Kardon, commande vocale Alexa, 24h d''autonomie.' WHERE name = '50S';
UPDATE public.installation_intercoms SET description = 'Version compacte du 50S. Mesh 2.0, 8 riders, 2 km. Discret et léger, 24h d''autonomie. Idéal pour les casques sport et intégraux.' WHERE name = '50R';
UPDATE public.installation_intercoms SET description = 'Technologie Mesh + Bluetooth 4.1 en un seul appareil. 8 riders, 2 km de portée. Compatible avec tous les réseaux Sena Mesh.' WHERE name = '30K';
UPDATE public.installation_intercoms SET description = 'DMC Mesh 2.0 ultra-compact. 15 riders sans limite de portée. Profil discret, son premium, batterie 13h.' WHERE name = 'PackTalk Slim';
UPDATE public.installation_intercoms SET description = 'Le pilier de la gamme Cardo. DMC Mesh, 15 riders, portée illimitée, son JBL, 13h d''autonomie, résistant aux intempéries.' WHERE name = 'PackTalk Bold';
UPDATE public.installation_intercoms SET description = 'Cardo nouvelle génération. DMC Mesh 2.0, 15 riders, son JBL, assistant vocal, autonomie 13h. Le meilleur de Cardo.' WHERE name = 'PackTalk Edge';
UPDATE public.installation_intercoms SET description = 'Entrée de gamme Cardo. 4 riders, Bluetooth, FM, son stéréo, 10h d''autonomie. Simple et efficace.' WHERE name = 'Freecom 4+';
