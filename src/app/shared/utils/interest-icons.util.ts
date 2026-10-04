/**
 * Authoritative mapping of interest and category labels to authentic Google Material Symbol icons.
 */
export function getInterestIcon(interest: any): string {
  const label = (typeof interest === 'string' ? interest : interest?.displayLabel || interest?.label || '').toLowerCase().trim();
  if (!label) return 'local_activity';

  if (label.includes('fitness') || label.includes('gym') || label.includes('workout') || label.includes('yoga') || label.includes('exercise')) {
    return 'fitness_center';
  }
  if (label.includes('esport') || label.includes('gaming') || label.includes('game')) {
    return 'sports_esports';
  }
  if (label.includes('camp')) {
    return 'camping';
  }
  if (label.includes('trek') || label.includes('hike') || label.includes('hiking')) {
    return 'hiking';
  }
  if (label.includes('nightlife') || label.includes('club') || label.includes('pub') || label.includes('bar')) {
    return 'local_bar';
  }
  if (label.includes('food') || label.includes('dining') || label.includes('culinary') || label.includes('cook') || label.includes('eat')) {
    return 'restaurant';
  }
  if (label.includes('coffee') || label.includes('cafe') || label.includes('chai') || label.includes('tea')) {
    return 'coffee';
  }
  if (label.includes('concert') || label.includes('music') || label.includes('gig') || label.includes('band')) {
    return 'music_note';
  }
  if (label.includes('photo') || label.includes('camera')) {
    return 'photo_camera';
  }
  if (label.includes('movie') || label.includes('cinema') || label.includes('film')) {
    return 'movie';
  }
  if (label.includes('road trip') || label.includes('drive') || label.includes('car')) {
    return 'directions_car';
  }
  if (label.includes('beach') || label.includes('surf') || label.includes('coastal') || label.includes('sea')) {
    return 'beach_access';
  }
  if (label.includes('travel') || label.includes('trip') || label.includes('voyage') || label.includes('tour')) {
    return 'explore';
  }
  if (label.includes('festival') || label.includes('carnival') || label.includes('fiesta')) {
    return 'festival';
  }
  if (label.includes('meetup') || label.includes('network') || label.includes('tech') || label.includes('conference')) {
    return 'groups';
  }
  if (label.includes('wedding') || label.includes('reception')) {
    return 'celebration';
  }
  if (label.includes('birthday') || label.includes('anniversary')) {
    return 'cake';
  }
  if (label.includes('art') || label.includes('paint') || label.includes('design') || label.includes('draw')) {
    return 'palette';
  }
  if (label.includes('book') || label.includes('read') || label.includes('literat')) {
    return 'menu_book';
  }
  if (label.includes('dance')) {
    return 'nightlife';
  }
  if (label.includes('comedy') || label.includes('standup')) {
    return 'theater_comedy';
  }
  if (label.includes('nature') || label.includes('wildlife') || label.includes('forest')) {
    return 'forest';
  }

  return 'local_activity';
}
