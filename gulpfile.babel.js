import {src, dest, watch, parallel} from 'gulp';
import gulpPlumber from 'gulp-plumber';
import gulpBabel from 'gulp-babel';

export const babel = () => {
  return src('./src/*.js')
    .pipe(gulpPlumber())
    .pipe(gulpBabel())
    .pipe(dest('./dist'));
};

export default () => {
  watch('./src/*.js', parallel('babel'));
  babel();
};
