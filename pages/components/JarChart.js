import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { pickleGreen, backgroundColor, cardColor } from './constants';
import JarValueChart from './JarValueChart';
import Skeleton from '@material-ui/lab/Skeleton';

const jarApi = 'https://api.pickle-jar.info/jar';
const useStyles = makeStyles(() => ({
  paper: {
    backgroundColor: cardColor,
    border: `1px solid ${pickleGreen}`,
  },
  container: {
    backgroundColor: backgroundColor,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2px'
  },
  avatar: {
    height: 35,
    width: 35,
    marginBottom: '5px',
    marginRight: '10px',
    marginLeft: '10px',
  },
}));

const normalize = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function AssetChart(props) {
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }

  const {
    asset,
    xs,
    sm,
    md,
    format,
    tooltip
  } = props.chart;
  const classes = useStyles();

  const targetRef = useRef();
  const [width, setWidth] = useState(undefined);
  const handleResize = () => {
    if (targetRef.current) {
      setWidth(targetRef.current.clientWidth);
    }
  };
  useEffect(() => {
    handleResize();
    updateData(asset);
  }, []);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return _ => {
      window.removeEventListener('resize', handleResize);
    };
  });

  let valueFormat = format ? format : "${0}";
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const updateData = async (asset) => {
    const response = await fetch(jarApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({asset: asset.toLowerCase()})
    }).then(data => data.json());
    let data = response.map(d => ({x: d.x, y: parseFloat(d.y)}));
    let lastIndex = data[data.length - 1];
    setData(data);
    setValue(valueFormat.format(normalize(lastIndex.y)));
    setLoaded(true);
    if (props.onUpdate) {
      props.onUpdate({block: lastIndex.x, value: lastIndex.y});
    }
  };

  const icon = `./assets/${asset.toLowerCase()}.png`;
  return (
    <>
      <Grid item xs={xs} sm={sm} md={md} className={classes.container}>
        <div className={classes.header}>
          <Avatar variant='square' alt={asset} src={icon} className={classes.avatar} />
          <Typography variant='h5'>
            {asset}: {value}
          </Typography>
        </div>
        <Paper className={classes.paper} ref={targetRef}>
          {
            loaded ?
            <JarValueChart width={width} height={300} data={data} tooltip={tooltip} /> :
            <Skeleton variant="rect" animation="wave" width={width} height={300} />
          }
        </Paper>
      </Grid>
    </>
  );
}
