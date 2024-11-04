import { expect, test, describe } from "vitest";
import { findMatch } from "./index.js";

const expectedMatches = {
    help: [
        "perdu mes ACCÈS à ma boite",
        "j'ai perdu mes accès à ma boite",
        "j'ai perdu mes accès à ma BOITE email",
    ],
    ops: [
        "créer la mailing list",
        "comment créer la MAILING LIST",
        "comment créer la mailing list pour xxxx",
    ],
};
const expecteNotMatches = {
    help: [
        "comment faire une tarte aux pommes",
        "j'ai perdu ma boite",
        "créer un compte",
    ],
    ops: ["j'ai perdu mes accès à ma boite email"],
};

describe("findMatch should match", () => {
    Object.entries(expectedMatches).map(([key, value]) => {
        value.forEach((h) => {
            test(`${key}: ${h}`, () => {
                expect(findMatch(key, h)).toBeTruthy();
            });
        });
    });
});
describe("findMatch should NOT match", () => {
    Object.entries(expecteNotMatches).map(([key, value]) => {
        value.forEach((h) => {
            test(`${key}: ${h}`, () => {
                expect(findMatch(key, h)).toBeFalsy();
            });
        });
    });
});
