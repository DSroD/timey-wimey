{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [
    pkgs.nodePackages.pnpm
  ];
  
  shellHook = ''
    echo "Installing packages..."
    pnpm i
  '';
}