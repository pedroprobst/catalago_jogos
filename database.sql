-- =============================================================================
-- TRABALHO ACADÊMICO: PROGRAMAÇÃO WEB
-- SISTEMA: CATÁLOGO DE JOGOS & FÓRUM DE REVIEWS
-- ARQUIVO: database.sql (Definição de Tabelas, Migrações e Carga Inicial)
-- =============================================================================

-- 1. Criação da Tabela Principal de Jogos (se não existir)
CREATE TABLE IF NOT EXISTS jogos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    genero VARCHAR(50) NOT NULL,
    imagem TEXT NOT NULL,
    sinopse TEXT NOT NULL,
    comentarios TEXT,
    plataforma VARCHAR(100) NOT NULL DEFAULT 'PC',
    preco NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    avaliacao NUMERIC(3, 1) NOT NULL DEFAULT 5.0 CHECK (avaliacao >= 0 AND avaliacao <= 5)
);

-- 2. Migrações Seguras (garante compatibilidade caso a tabela já tenha sido criada anteriormente)
ALTER TABLE jogos ADD COLUMN IF NOT EXISTS plataforma VARCHAR(100) DEFAULT 'PC';
ALTER TABLE jogos ADD COLUMN IF NOT EXISTS preco NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE jogos ADD COLUMN IF NOT EXISTS avaliacao NUMERIC(3, 1) DEFAULT 5.0;

-- 3. Limpeza para inserção limpa do Seed com novos campos
TRUNCATE TABLE jogos RESTART IDENTITY;

-- 4. Inserção de Dados Iniciais (Seed) - 12 Jogos completos com Plataforma, Preço e Avaliação (0 a 5)
INSERT INTO jogos (titulo, genero, imagem, sinopse, comentarios, plataforma, preco, avaliacao) VALUES
(
    'The Witcher 3: Wild Hunt',
    'RPG de Ação',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3XLeHTANtWNCyX8ClDmID_y0PCyMgEudvP8r1yTs8HA&s=10',
    'Você é Geralt de Rívia, um mercenário caçador de monstros. Em um continente devastado pela guerra e infestado de criaturas vorazes, você precisa encontrar Ciri, a Criança da Profecia.',
    'Review da Comunidade: Uma obra-prima narrativa com missões secundárias riquíssimas e trilha sonora inesquecível. Nota 10/10.',
    'PC, PS5, Xbox Series X|S, Switch',
    129.90,
    4.9
),
(
    'Red Dead Redemption 2',
    'Mundo Aberto / Ação',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyBgFoFIkps4Vo2wiYVVRSu1D14WgjNOji58uZsqoEtQ&s=10',
    'Estados Unidos, 1899. O fim da era do Velho Oeste começou. Arthur Morgan e a gangue Van der Linde são forçados a fugir após um assalto dar errado em Blackwater.',
    'Review da Comunidade: O nível de detalhes e a evolução do personagem Arthur Morgan estabeleceram um novo patamar para os videogames.',
    'PC, PS4, Xbox One',
    299.90,
    4.8
),
(
    'The Legend of Zelda: Breath of the Wild',
    'Aventura / RPG',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYzU1hUH6zDIS2UHje6QvVdXM-aRfR6uOn9T4hTF_80g&s=10',
    'Esqueça tudo o que sabe sobre os jogos The Legend of Zelda. Entre em um mundo de descoberta, exploração e aventura em Hyrule, acordando após 100 anos de sono profundo.',
    'Review da Comunidade: Redefiniu o conceito de física e liberdade nos jogos de mundo aberto. A sensação de descoberta é pura magia.',
    'Nintendo Switch, Wii U',
    299.00,
    5.0
),
(
    'Elden Ring',
    'Soulslike / RPG',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEoEIu9q3lyJNRrAqFHxhPO5DSutMfjOx029cUSRuZFw&s=10',
    'Nas Terras Intermédias governadas pela Rainha Marika, o Anel Prístino foi destruído. Como um Maculado, levante-se e reivindique o poder do Anel para se tornar o Lorde Prístino.',
    'Review da Comunidade: A melhor transição de fórmula Souls para mundo aberto já criada. Combate exigente e arte visual deslumbrante.',
    'PC, PS5, PS4, Xbox Series X|S',
    229.90,
    4.8
),
(
    'God of War Ragnarök',
    'Ação / Aventura',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgku4SxrbkSNKW_HscO1gIXRToGruEiZvOt00G1dbLzw&s=10',
    'Junto a Kratos e Atreus, embarque em uma jornada épica e comovente enquanto enfrentam o Fimbulwinter e o destino iminente da guerra profetizada pelos Deuses Nórdicos.',
    'Review da Comunidade: Conclusão emocionante da saga nórdica. O combate com o Machado Leviatã e as Lâminas do Caos continua visceral.',
    'PS5, PS4, PC',
    299.90,
    4.7
),
(
    'Hollow Knight',
    'Metroidvania',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT42jjBuky3nYcETUVhiRtpVyP_IjNoQwDEnL0yjJmK6A&s=10',
    'Desça ao reino esquecido de Hallownest. Enfrente insetos e feras corrompidas e desvende os mistérios ancestrais ocultos no coração deste antigo labirinto subterrâneo.',
    'Review da Comunidade: Considerado por muitos o melhor jogo indie já produzido. Direção de arte desenhada à mão soberba e chefes desafiadores.',
    'PC, Switch, PS4, Xbox One',
    46.99,
    4.9
),
(
    'Cyberpunk 2077',
    'RPG / Ficção Científica',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREdO3YvXbnRNRRxpPnY2J7E7m0RJt4hWqezbEEvQ7XEg&s=10',
    'Em Night City, uma megalópole obcecada por poder, glamour e modificações corporais, você joga como V, um mercenário fora da lei atrás de um implante único que carrega a chave da imortalidade.',
    'Review da Comunidade: Após as grandes atualizações e a DLC Phantom Liberty, tornou-se um RPG imersivo e espetacular no gênero cyberpunk.',
    'PC, PS5, Xbox Series X|S',
    199.90,
    4.4
),
(
    'Grand Theft Auto V',
    'Ação / Mundo Aberto',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbU_CeMzV-w48GkTStqEPf9B_AmoCEF9AXyPzxHgsVNQ&s=10',
    'Três criminosos muito diferentes — Michael, Franklin e Trevor — arriscam tudo em uma série de golpes audaciosos e perigosos que podem garantir o futuro deles em Los Santos.',
    'Review da Comunidade: Um clássico absoluto dos games que transcendeu gerações com uma sátira social ácida e jogabilidade incomparável.',
    'PC, PS5, PS4, Xbox Series X|S',
    82.40,
    4.8
),
(
    'Minecraft',
    'Sandbox / Sobrevivência',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyyPATmrrOQ3R9oKXZJO56BS7MzgXVdK5fstLkTDdNbw&s=10',
    'Explore um mundo gerado aleatoriamente e construa tudo, desde a mais simples das casas até o mais grandioso dos castelos, enfrentando monstros perigosos durante a noite.',
    'Review da Comunidade: Criatividade sem limites. O jogo mais vendido de todos os tempos continua relevante e cativante para todas as idades.',
    'PC, Switch, PS4, Xbox, Mobile',
    149.00,
    4.9
),
(
    'Resident Evil 4 Remake',
    'Terror / Sobrevivência',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnOXAQFE6SWdIZy6b4OpXDWYJUjkIbnYx7gQLCRunJ3w&s=10',
    'Seis anos se passaram desde a catástrofe biológica em Raccoon City. O agente Leon S. Kennedy é enviado para resgatar a filha sequestrada do presidente em uma isolada vila europeia.',
    'Review da Comunidade: Exemplo perfeito de como modernizar um clássico sem perder a essência do terror e ação tensa.',
    'PC, PS5, PS4, Xbox Series X|S',
    169.00,
    4.7
),
(
    'Portal 2',
    'Puzzle / Sci-Fi',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkeaeogj9aknqEj3w-xOZFu9YwnoxcjoGrn9Ds0bQpQw&s=10',
    'Preso nos laboratórios devastados da Aperture Science, use a arma de portais e sua inteligência para desvendar câmaras de teste intrincadas sob a vigília sarcástica de GLaDOS.',
    'Review da Comunidade: Roteiro hilário, design de quebra-cabeças genial e uma das melhores experiências cooperativas da história.',
    'PC, Switch, Xbox 360, PS3',
    32.99,
    4.9
),
(
    'Genshin Impact',
    'RPG / Ação em Mundo Aberto',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWXSFaNJ_XI7nw1_go6tGSAd2PmBpbSKxkz53-Ftd1QmBQFMLCnHCQIYDq&s=10',
    'Embarque em uma jornada por Teyvat, um mundo fantástico onde incontáveis criaturas prosperam e os sete elementos convergem. Encontre seu irmão ou irmã perdido.',
    'Review da Comunidade: Mundo aberto gigantesco, atualizações constantes e combate dinâmico, totalmente gratuito para jogar.',
    'PC, PS5, PS4, Mobile',
    0.00,
    4.5
);
