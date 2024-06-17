{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.nodejs_18
    pkgs.nodePackages.typescript-language-server
  ];
}

