import { Team } from '../types';

export function getMatchVenue(round: number, index: number) {
  const venues = [
    { stadium: 'Estadio Azteca', city: 'Mexico City, Mexico' },
    { stadium: 'MetLife Stadium', city: 'New York/New Jersey, USA' },
    { stadium: 'SoFi Stadium', city: 'Los Angeles, USA' },
    { stadium: 'BC Place', city: 'Vancouver, Canada' },
    { stadium: 'AT&T Stadium', city: 'Dallas, USA' },
    { stadium: 'Hard Rock Stadium', city: 'Miami, USA' },
    { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta, USA' },
    { stadium: 'Gillette Stadium', city: 'Boston, USA' },
    { stadium: 'Lumen Field', city: 'Seattle, USA' },
    { stadium: 'Estadio BBVA', city: 'Monterrey, Mexico' },
    { stadium: 'BMO Field', city: 'Toronto, Canada' },
    { stadium: 'Estadio Akron', city: 'Guadalajara, Mexico' },
    { stadium: 'NRG Stadium', city: 'Houston, USA' },
    { stadium: 'Lincoln Financial Field', city: 'Philadelphia, USA' },
    { stadium: 'Arrowhead Stadium', city: 'Kansas City, USA' }
  ];

  if (round === 4) {
    return { stadium: 'MetLife Stadium', city: 'New York/New Jersey, USA' };
  } else if (round === 3) {
    return index === 0 
      ? { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta, USA' }
      : { stadium: 'SoFi Stadium', city: 'Los Angeles, USA' };
  } else if (round === 2) {
    const qfVenues = [
      { stadium: 'BC Place', city: 'Vancouver, Canada' },
      { stadium: 'Estadio Azteca', city: 'Mexico City, Mexico' },
      { stadium: 'Gillette Stadium', city: 'Boston, USA' },
      { stadium: 'Hard Rock Stadium', city: 'Miami, USA' }
    ];
    return qfVenues[index % 4];
  } else {
    return venues[(round * 8 + index) % venues.length];
  }
}

export function getTeamLineup(team: Team) {
  const star = team.starPlayer;

  const countrySurnames: Record<string, string[]> = {
    de: ['Neuer', 'Kimmich', 'Rüdiger', 'Tah', 'Raum', 'Andrich', 'Kroos', 'Musiala', 'Wirtz', 'Sane', 'Füllkrug'],
    fr: ['Maignan', 'Hernandez', 'Upamecano', 'Saliba', 'Koundé', 'Tchouaméni', 'Rabiot', 'Kanté', 'Griezmann', 'Dembélé', 'Mbappé'],
    br: ['Alisson', 'Danilo', 'Marquinhos', 'Gabriel', 'Arana', 'Guimarães', 'Gomes', 'Paquetá', 'Raphinha', 'Rodrygo', 'Vinícius Jr'],
    ar: ['Martínez', 'Molina', 'Romero', 'Otamendi', 'Tagliafico', 'De Paul', 'Fernández', 'Mac Allister', 'Messi', 'Alvarez', 'Di María'],
    gb: ['Pickford', 'Walker', 'Stones', 'Guehi', 'Trippier', 'Rice', 'Mainoo', 'Bellingham', 'Saka', 'Kane', 'Foden'],
    es: ['Simon', 'Carvajal', 'Le Normand', 'Laporte', 'Cucurella', 'Rodri', 'Ruiz', 'Pedri', 'Yamal', 'Morata', 'Williams'],
    pt: ['Costa', 'Cancelo', 'Dias', 'Pepe', 'Mendes', 'Palhinha', 'Vitinha', 'Fernandes', 'Silva', 'Ronaldo', 'Leão'],
    nl: ['Verbruggen', 'Dumfries', 'De Vrij', 'Van Dijk', 'Aké', 'Schouten', 'Reijnders', 'Simons', 'Frimpong', 'Depay', 'Gakpo'],
    hr: ['Livaković', 'Stanišić', 'Šutalo', 'Gvardiol', 'Sosa', 'Modrić', 'Kovačić', 'Brozović', 'Kramarić', 'Petković', 'Perišić'],
    be: ['Casteels', 'Castagne', 'Faes', 'Vertonghen', 'Theate', 'Onana', 'Mangala', 'De Bruyne', 'Doku', 'Lukaku', 'Trossard'],
    jp: ['Suzuki', 'Suga', 'Itakura', 'Machida', 'Ito', 'Endo', 'Morita', 'Mitoma', 'Minamino', 'Kubo', 'Maeda'],
    kr: ['Jo', 'Kim M.', 'Kim Y.', 'Seol', 'Lee K.', 'Hwang I.', 'Hwang H.', 'Son', 'Cho', 'Lee J.', 'Park'],
    us: ['Turner', 'Scally', 'Richards', 'Ream', 'Robinson', 'McKennie', 'Adams', 'Musah', 'Weah', 'Balogun', 'Pulisic'],
    mx: ['Gonzalez', 'Sanchez', 'Montes', 'Vasquez', 'Arteaga', 'Chavez', 'Alvarez', 'Pineda', 'Antuna', 'Gimenez', 'Quiñones'],
    ca: ['Crepeau', 'Johnston', 'Bombito', 'Cornelius', 'Davies', 'Kone', 'Eustaquio', 'Millar', 'David', 'Larin', 'Buchanan'],
    no: ['Nyland', 'Ryerson', 'Ajer', 'Ostigard', 'Wolfe', 'Berge', 'Thorsby', 'Odegaard', 'Haaland', 'Sorloth', 'Nusa'],
    uy: ['Rochet', 'Nandez', 'Araujo', 'Gimenez', 'Olivera', 'Valverde', 'Ugarte', 'De la Cruz', 'Pellistri', 'Nunez', 'Olivera M.'],
    co: ['Vargas', 'Munoz', 'Sanchez', 'Cuesta', 'Mojica', 'Rios', 'Lerma', 'Arias', 'Rodriguez', 'Cordoba', 'Diaz'],
    py: ['Fernández', 'Velázquez', 'Gómez', 'Alderete', 'Alonso', 'Cubas', 'Villasanti', 'Almirón', 'Enciso', 'Sosa', 'Sanabria'],
    se: ['Olsen', 'Krafth', 'Hien', 'Lindelöf', 'Augustinsson', 'Cajuste', 'Larsson', 'Kulusevski', 'Forsberg', 'Isak', 'Gyökeres'],
    ma: ['Bounou', 'Hakimi', 'Aguerd', 'Saïss', 'Mazraoui', 'Amrabat', 'Ounahi', 'Amallah', 'Ziyech', 'En-Nesyri', 'Boufal'],
    at: ['Pentz', 'Posch', 'Danso', 'Wöber', 'Mwene', 'Seiwald', 'Laimer', 'Sabitzer', 'Baumgartner', 'Gregoritsch', 'Alaba'],
    sn: ['Mendy', 'Sabaly', 'Koulibaly', 'Diallo', 'Jakobs', 'Gueye', 'Mendy N.', 'Sarr', 'Camara', 'Mané', 'Jackson'],
    gh: ['Ati-Zigi', 'Seidu', 'Djiku', 'Salisu', 'Mensah', 'Samed', 'Partey', 'Ayew', 'Kudus', 'Williams', 'Semenyo'],
    ie: ['Kelleher', 'Coleman', 'Collins', 'O\'Shea', 'Brady', 'Smallbone', 'Cullen', 'Knight', 'Szmodics', 'Idah', 'Ferguson'],
    ec: ['Galíndez', 'Preciado', 'Torres', 'Pacho', 'Hincapié', 'Franco', 'Caicedo', 'Gruezo', 'Páez', 'Valencia', 'Sarmiento'],
    cd: ['M\'Pasi', 'Kalulu', 'Mbemba', 'Baka', 'Masuaku', 'Moutoussamy', 'Pickel', 'Bongonda', 'Kakuta', 'Elia', 'Wissa'],
    au: ['Ryan', 'Jones', 'Souttar', 'Rowles', 'Behich', 'Metcalfe', 'Baccus', 'McGree', 'Boyle', 'Irankunda', 'Duke'],
    eg: ['El Shenawy', 'Hany', 'Abdelmonem', 'Hegazi', 'Hamdi', 'Elneny', 'Fathi', 'Ashour', 'Salah', 'Mostafa', 'Trézéguet'],
    ch: ['Sommer', 'Widmer', 'Akanji', 'Schär', 'Rodriguez', 'Freuler', 'Xhaka', 'Aebischer', 'Ndoye', 'Vargas', 'Embolo'],
    dz: ['Mandrea', 'Atal', 'Mandi', 'Bensebaini', 'Ait-Nouri', 'Bentaleb', 'Bennacer', 'Aouar', 'Mahrez', 'Bounedjah', 'Amoura'],
    sa: ['Al-Owais', 'Al-Ghannam', 'Al-Amri', 'Al-Bulaihi', 'Al-Shahrani', 'Kanno', 'Al-Khaibari', 'Al-Najei', 'Al-Muwallad', 'Al-Shehri', 'Al-Dawsari']
  };

  const defaultLineup = [
    { number: 1, name: 'Goalkeeper', pos: 'GK' },
    { number: 2, name: 'Defender L', pos: 'DF' },
    { number: 3, name: 'Defender C1', pos: 'DF' },
    { number: 4, name: 'Defender C2', pos: 'DF' },
    { number: 5, name: 'Defender R', pos: 'DF' },
    { number: 6, name: 'Midfielder C1', pos: 'MF' },
    { number: 8, name: 'Midfielder C2', pos: 'MF' },
    { number: 10, name: 'Playmaker', pos: 'MF' },
    { number: 7, name: 'Winger R', pos: 'FW' },
    { number: 9, name: 'Striker', pos: 'FW' },
    { number: 11, name: 'Winger L', pos: 'FW' },
  ];

  const surnames = countrySurnames[team.id] || [];
  if (surnames.length === 11) {
    return defaultLineup.map((p, idx) => {
      const name = surnames[idx];
      const isStar = name.toLowerCase().includes(star.split(' ').pop()?.toLowerCase() || 'xyz') || name === star;
      return {
        number: p.number,
        name: isStar ? star : name,
        pos: p.pos,
        isStar: isStar || name === star
      };
    });
  }

  // Fallback procedural names
  return defaultLineup.map((p, idx) => {
    let name = '';
    let isStar = false;
    if (idx === 9) {
      name = star;
      isStar = true;
    } else {
      name = `${team.name} Player #${idx + 1}`;
    }
    return {
      number: p.number,
      name,
      pos: p.pos,
      isStar
    };
  });
}
