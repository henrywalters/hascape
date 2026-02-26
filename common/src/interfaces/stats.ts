export interface IStats {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface IStat {
    name: string;
    key: keyof IStats;
    icon: string;
}

export const StatList: IStat[] = [
    {
        name: 'Strength', 
        key: 'strength',
        icon: 'strength',
    },
    {
        name: 'Dexterity',
        key: 'dexterity',
        icon: 'dexterity',
    },
    {
        name: 'Constitution',
        key: 'constitution',
        icon: 'constitution',
    },
]