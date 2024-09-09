import React from 'react';
import GridView from './GridView';
import ColorView from './ColorView';
import styles from './App.module.css';
export default function App () {

  return (
    <div className={styles.root}>
      <p>
        A visualization of Bridsons algorithm for generating Poisson-disc sampling. Poisson-disc sampling generates sets of discs packed no tighter than a characteristic distance R. Bridson's algorithm generates candidates from an active list of existing discs (colored blue in this demonstration) and uses a grid to decrease the number of samples candidates need to be checked against.
      </p>
      <GridView />
      <p>
        Here is the algorithm applied to 3d, with the potential application for generating perceptually distinct random colors.
      </p>
      <ColorView />
      <p>
        Poisson-disc sampling is an useful technique for generating blue noise which is common nowadays in rendering (see <a href="https://developer.nvidia.com/blog/rendering-in-real-time-with-spatiotemporal-blue-noise-textures-part-2/">here for some examples</a>)
        </p>
    </div>
  )
}