{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.nodejs_18
    pkgs.corepack
    pkgs.yarn
    pkgs.nodePackages.typescript-language-server
  ];
}

