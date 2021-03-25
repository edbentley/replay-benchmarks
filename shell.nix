with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "node_14";

  buildInputs = [
    pkgs.nodejs-14_x
  ];
}
