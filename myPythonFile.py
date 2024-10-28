import numpy as np
import tensorflow as tf
import keras
import chessLibraryHelper as clh
import sys

clhboard = clh.clhBoard()

def main():
    #python3 ./myPythonFile.py r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R
    if len(sys.argv) > 1:
        fenString = sys.argv[1] + " b" #TODO: always assuming that the player is white for now
        clhboard.set_fen(fenString)
    state = clhboard.state()

    q_network = keras.models.load_model('q_network.keras')
    input = np.expand_dims(state, axis=0)
    output = q_network(input, training=False)
    moveInt = np.argmax(output)
    try:
        move = clhboard.moveFromInteger(moveInt)
        clhboard.push(move)
        print(clhboard.fen())
    except Exception as err:
        print(err)

main()