import React from 'react';
import { Point3, createPoisson, PoissonArgs, Poisson } from './poissonCube';
import CanvasView from './CanvasView';
import useInterval from './useInterval';

import * as THREE from 'three';
import styles from './App.module.css';
export default function ColorView () {

  const width = 400;
  const height = 400;
  const [ running, setRunning ] = React.useState( true );

  const mref = React.useRef();
  const [ arrows, setArrows ] = React.useState<boolean>( false );
  const [ r, setR ] = React.useState<number>( 60 );
  const k = 20;
  const [ poisson, setPoisson ] = React.useState<Poisson>( createPoisson( {
    r,
    k,
    xmin: 0,
    xmax: 256,
    ymin: 0,
    ymax: 256,
    zmin: 0,
    zmax: 256,
  } as PoissonArgs ) )

  useInterval( () => {
    if ( poisson.getDone() ) {
      setPoisson( createPoisson( {
        r,
        k,
        xmin: 0,
        xmax: 256,
        ymin: 0,
        ymax: 256,
        zmin: 0,
        zmax: 256,
      } as PoissonArgs ) );
    }
    else poisson.step();
  }, 1000 / 30, [ poisson ] )


  let renderer: any = null;
  const camera = new THREE.PerspectiveCamera( 80, width / height, 1, 10000 );

  function drawSpheres (scene: THREE.Scene) {
    const geo = new THREE.SphereGeometry( 25/2, 16, 16 );
    const points: Array<Point3> = poisson.getPoints();
    for ( let i = 0; i < points.length; i++ ) {
      const { x, y, z } = points[ i ];
      const color = new THREE.Color( x / 256, y / 256, z / 256 );

      const mat = new THREE.MeshBasicMaterial( {
        color,
      } );
      const mesh = new THREE.Mesh( geo, mat );
      mesh.position.set( x, y, z );

      scene.add( mesh );

    }
  }
  
  function drawArrows (scene: THREE.Scene) {
    const pp = poisson.getPP();
    
    const mat = new THREE.LineBasicMaterial( { color: 0xffffff } );
    for (let i = 1; i < pp.length; i++) {
       const { point, pIndex } = pp[i];
       const last = pp[pIndex].point;
       const geo = new THREE.BufferGeometry().setFromPoints(
        [ new THREE.Vector3(point.x, point.y, point.z),
          new THREE.Vector3(last.x, last.y, last.z),
        ]
       );
       const line = new THREE.Line(geo, mat);
       
       scene.add(line);
    }
  }
  
  function drawCube (scene: THREE.Scene) {
    const center = new THREE.Vector3( 128, 128, 128 );

    const cubegeo = new THREE.BoxGeometry( 256, 256, 256 );
    const cubemat = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    } );
    const cubemesh = new THREE.Mesh( cubegeo, cubemat );
    cubemesh.position.set( center.x, center.y, center.z );
    scene.add( cubemesh );
  }
  const myRenderer = React.useCallback( ( canvas: HTMLCanvasElement ) => {
    if ( !renderer ) {
      renderer = new THREE.WebGLRenderer( {
        antialias: true,
        canvas: canvas,
      } )
    }

    const center = new THREE.Vector3( 128, 128, 128 );
    camera.position.y = 128;
    const bleh = Date.now() * 0.001;
    camera.position.x = 128 + 500 * Math.cos( bleh );
    camera.position.z = 128 + 500 * Math.sin( bleh );

    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );

    drawCube(scene);
    drawSpheres(scene);
    if (arrows) drawArrows(scene);

    camera.lookAt( center );
    renderer.render( scene, camera );
  }, [ poisson, arrows ] )


  const onChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const newR = Number( e.target.value );
    setR( newR );
    setPoisson(
      createPoisson( {
        r: newR,
        k,
        xmin: 0,
        xmax: 256,
        ymin: 0,
        ymax: 256,
        zmin: 0,
        zmax: 256,
      } as PoissonArgs ) )
  };
  return (
    <div className={ styles.demo }>
      <button onClick={ () => setArrows( !arrows ) }>{ arrows ? 'Show arrows' : 'No arrows' }</button>
      <div>
        <input type={ 'range' } id={ 'r-value' } value={ r } min={ 40 } max={ 80 } onChange={ onChange } />
        <label htmlFor={ 'r-value' }>Distance</label>
      </div>
      <CanvasView render={ myRenderer } width={ width } height={ height } />
    </div>
  )
}