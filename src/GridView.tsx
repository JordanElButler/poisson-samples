import React from 'react';
import { PP, Point, createPoisson, Poisson, PoissonArgs } from './poisson';

import CanvasView from './CanvasView';
import useInterval from './useInterval';
import styles from './App.module.css';

export default function GridView () {

  const width = 400;
  const height = 400;
  const [ running, setRunning ] = React.useState( true );

  const [r, setR] = React.useState<number>(30);
  const k = 20;
  const [ poisson, setPoisson ] = React.useState<Poisson>( createPoisson( {
    r,
    k,
    xmin: 0,
    xmax: width,
    ymin: 0,
    ymax: height,
  } as PoissonArgs ) )
  const [ rerender, setRerender ] = React.useState<number>( 0 );
  const [ arrows, setArrows ] = React.useState<boolean>(false);
  const [showGrid, setShowGrid] = React.useState<boolean>(false);
  
  function drawGrid ( context: CanvasRenderingContext2D ) {
    const { grid, gridSize } = poisson.getGrid();
    context.lineWidth = 1;
    context.strokeStyle = 'rgb(255, 255, 255)';
    for ( let i = 0; i < grid.length; i++ ) {
      for ( let j = 0; j < grid[ i ].length; j++ ) {
        if ( grid[ i ][ j ] !== -1 ) {
          context.fillStyle = 'rgb(200, 0, 0)'
        } else {
          context.fillStyle = 'rgb(0, 0, 0)'
        }
        context.beginPath();
        context.rect( j * gridSize, i * gridSize, gridSize, gridSize );
        context.fill();
        context.stroke();
      }
    }
  }

  function drawPoints ( context: CanvasRenderingContext2D ) {
    const pointRadius = 4;
    const points = poisson.getPP();
    const activeList = poisson.getActiveList();
    context.fillStyle = 'rgb(0, 255, 0)'; // do alpha as well

    for ( let i = 0; i < points.length; i++ ) {
      const { x, y } = points[ i ].point;
      context.beginPath();
      context.arc( x, y, pointRadius, 0, 2 * Math.PI );
      context.fill();
    }

    context.fillStyle = 'rgb(0, 0, 255)';
    for ( let i = 0; i < activeList.length; i++ ) {
      const { x, y } = points[ activeList[ i ] ].point;
      context.beginPath();
      context.arc( x, y, pointRadius, 0, 2 * Math.PI );
      context.fill();
    }

    // draw activeIndex in magenta;
    if ( activeList.length > 0 ) {
      const { x, y } = points[ activeList[ activeList.length - 1 ] ].point;
      context.fillStyle = 'rgb(255, 0, 255)'
      context.beginPath();
      context.arc( x, y, pointRadius, 0, 2 * Math.PI );
      context.fill()

    }
  }

  function drawArrows ( context: CanvasRenderingContext2D ) {
    context.lineWidth = 2;
    context.strokeStyle = 'rgb(255, 255, 255)'
    const points = poisson.getPP();
    for ( let i = 1; i < points.length; i++ ) {
      const { point, pIndex } = points[ i ];
      const parent = points[ pIndex ].point;

      // draw arrow
      context.beginPath();
      context.moveTo( parent.x, parent.y );
      context.lineTo( point.x, point.y );
      context.stroke();
    }
  }
  function render ( canvas: HTMLCanvasElement ) {
    const context = canvas.getContext( '2d' )!;
    context.fillStyle = 'rgb(20  20, 20)'
    context.fillRect( 0, 0, canvas.width, canvas.height );

    if (showGrid) drawGrid(context);
    if ( arrows ) drawArrows( context );
    drawPoints( context );
  }


  useInterval( () => {
    if ( poisson.getDone() ) {
      setPoisson(
        createPoisson( {
          r,
          k,
          xmin: 0,
          xmax: width,
          ymin: 0,
          ymax: height,
        } as PoissonArgs ) )
    }
    else if ( running ) poisson.step();
  }, 1000 / 30, [ poisson, running, r ] );

  const myRenderer = React.useCallback( ( canvas: HTMLCanvasElement ) => {
    render( canvas );
  }, [ poisson, arrows, r, showGrid] )

  const [ pv, setPV ] = React.useState( false );
  const [ p, setP ] = React.useState( { x: -1, y: -1 } );

  const onPointerEnter = () => {
    setPV( true );
  }
  const onPointerMove = ( e: React.PointerEvent ) => {
    setP( { x: e.pageX, y: e.pageY } )
  }
  const onPointerLeave = () => {
    setPV( false )
  }

  const pstyle = {
    left: `${ Math.floor( p.x - r / 2 ) }px`,
    top: `${ Math.floor( p.y - r / 2 ) }px`,
    width: `${ Math.floor( r ) }px`,
  }
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newR: number = Number(e.target.value);
    setR(newR);
    setPoisson(
      createPoisson( {
        r: newR,
        k,
        xmin: 0,
        xmax: width,
        ymin: 0,
        ymax: height,
      } as PoissonArgs ) )
  };
  
  const divvyClass = `${styles.divvy} ${pv && styles.vissy}`;
  return (
    <div className={styles.demo} onPointerDown={onPointerMove} onPointerMove={ onPointerMove }>
      <button onClick={ () => setArrows( !arrows ) }>{ arrows ? 'Show arrows' : 'no arrows' }</button>
      <button onClick={ () => setShowGrid( !showGrid ) }>{showGrid ? 'Show grid' : 'no grid' }</button>
      <div>
        <input id={'r-value'} type={'range'} value={r} min={20} max={50} onChange={onChange} />
          <label htmlFor={'r-value'}>Distance</label>
          </div>
      <div style={ pstyle } className={ divvyClass }></div>
      <CanvasView onPointerEnter={ onPointerEnter } onPointerLeave={ onPointerLeave } render={ myRenderer } width={ width } height={ height } />
    </div>
  )
}