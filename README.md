# Shimit Pastéis — site oficial

Site da **Shimit Pastéis** (Sarandi-PR · em breve Maringá): vídeo com efeito de rolagem, cardápio do iFood, pedidos pelo iFood e WhatsApp, tour virtual 360° e galeria do Instagram.

## Estrutura
- `index.html` — página única
- `css/styles.css` — identidade visual (vermelho, amarelo, laranja e grafite)
- `js/config.js` — **WhatsApp, endereços, links do iFood e horário** (edite aqui)
- `js/menu.js` — **cardápio** (nome, descrição, preço, preço riscado, foto)
- `js/app.js` — interações (vídeo na rolagem, cardápio, tour 360, modal, galeria)
- `assets/video` — vídeo recortado (sem legenda) e capa
- `assets/pano` — fotos 360 tratadas para o tour (Pannellum)
- `assets/menu` — fotos dos pratos (iFood)
- `assets/ig`, `assets/img` — fotos do Instagram e quadros do vídeo

## Rodar localmente
O tour 360° precisa de um servidor (não funciona abrindo o arquivo direto):

```
python -m http.server 5173
```

Depois abra http://localhost:5173
