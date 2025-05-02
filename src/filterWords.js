/**
 * Room Name Filter
 * 
 * This file defines two arrays: `forbiddenRoomNames` and `forbiddenSubstrings`.
 * These are used to prevent users from creating or joining rooms with:
 * 
 * 1. Impersonation attempts (e.g., "admin", "mod", "neel", etc.)
 * 2. Offensive, adult, or abusive language in English or Hindi
 * 3. Violent or threatening terms (e.g., "terrorist", "kill")
 * 4. Hate speech, racial or homophobic slurs
 * 5. References to historical hate figures (e.g., "hitler", "kkk")
 * 6. Spammy or meaningless room names (e.g., "123", "asdf", "test")
 * 
 * These arrays are checked when creating or validating room names
 * to maintain a safe, respectful, and abuse-free community environment.
 */

export const forbiddenRoomNames = [
    // Identity misuse
    "admin","root","neel","ni","nil","neil","niel","ne","nee","administrator","mod","moderator","root","system","owner","n33l","ne3l","n3el","5ara","sayuri","5ayuri","sara",

    // General offensive / sexual / adult
    "sex","porn","xxx","hentai","nude","naked","boob","boobs","pussy","dick","penis","vagina","cunt","slut","whore","fucker","fucking","fuck","shit","bitch","asshole","dildo","cock","nips","nipple","suck","jerk","cum","anal","gayporn","lesbian","fap","pedo",

    // Hindi slurs/inappropriate
    "chutiya","bhosdi","gaand","madarchod","bhenchod","loda","lund","chut","randi","rakhail","gandu","haraami","kutte","kameene","bewakoof","sale","suar","jhant","chakka","launda","chinal","maa","behen","chudai","teri","bhai","bhen",

    // Hate speech / slurs
    "nigger","nigga","fag","faggot","retard","tranny","kike","chink","paki","spic","coon","gook","dyke",

    // Violent / threatening
    "kill","terror","terrorist","isis","osama","bomb","shoot","gun","stab","murder","rape",

    // Historical hate figures
    "hitler","nazi","binladen","stalin","kkk",

    // Misc spammy / trollish
    "test","123","asdf","qwerty","user","null","undefined","fake","bot","troll","impersonator",
  ];

  export const forbiddenSubstrings = [
    // Identity misuse
    "admin","root","neel","ni","nil","neil","niel","ne","nee","administrator","mod","moderator","root","system","owner","n33l","ne3l","n3el","5ara","sayuri","5ayuri","sara",

    // General offensive / sexual / adult
    "sex","porn","xxx","hentai","nude","naked","boob","boobs","pussy","dick","penis","vagina","cunt","slut","whore","fucker","fucking","fuck","shit","bitch","asshole","dildo","cock","nips","nipple","suck","jerk","cum","anal","gayporn","lesbian","fap","pedo",

    // Hindi slurs/inappropriate
    "chutiya","bhosdi","gaand","madarchod","bhenchod","loda","lund","chut","randi","rakhail","gandu","haraami","kutte","kameene","bewakoof","sale","suar","jhant","chakka","launda","chinal","maa","behen","chudai","teri","bhai","bhen",

    // Hate speech / slurs
    "nigger","nigga","fag","faggot","retard","tranny","kike","chink","paki","spic","coon","gook","dyke",

    // Violent / threatening
    "kill","terror","terrorist","isis","osama","bomb","shoot","gun","stab","murder","rape",

    // Historical hate figures
    "hitler","nazi","binladen","stalin","kkk",

    // Misc spammy / trollish
    "test","123","asdf","qwerty","user","null","undefined","fake","bot","troll","impersonator",
  ];

