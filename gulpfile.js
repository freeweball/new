const gulp = require(`gulp`);
const plumber = require(`gulp-plumber`);
const sourcemap = require(`gulp-sourcemaps`);
const sass = require(`gulp-sass`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const server = require(`browser-sync`).create();
const csso = require(`gulp-csso`);
const rename = require(`gulp-rename`);
const imagemin = require(`gulp-imagemin`);
const webp = require(`gulp-webp`);
const svgstore = require(`gulp-svgstore`)
const posthtml = require(`gulp-posthtml`);
const include = require(`posthtml-include`);
const del = require(`del`);
const pump = require(`pump`);
const concat = require(`gulp-concat`);
// const rollup = require(`gulp-better-rollup`);
// const sourcemaps = require(`gulp-sourcemaps`);

gulp.task(`js-libs`, (cb) => {
  pump([
    gulp.src(`source/js/ext/*.js`),
    concat(`vendor.js`),
    // uglify(),
    gulp.dest(`build/js/`)
  ],
    cb);
});

gulp.task(`scripts`, () => {
  return gulp.src(`source/js/**/*.js`)
    .pipe(plumber())
    .pipe(gulp.dest(`build/js/`));
});

gulp.task(`css-min`, () => {
  return gulp.src(`source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(csso())
    .pipe(rename(`style.min.css`))
    .pipe(sourcemap.write(`.`))
    .pipe(gulp.dest(`build/css`))
    .pipe(server.stream());
});

gulp.task(`css`, () => {
  return gulp.src(`source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulp.dest(`build/css`))
    .pipe(server.stream());
});

gulp.task(`server`, () => {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(`source/sass/**/*.{scss,sass}`, gulp.series(`css-min`, `css`));
  gulp.watch(`source/img/icon-*.svg`, gulp.series(`sprite`, `html`, `refresh`));
  gulp.watch(`source/*.html`, gulp.series(`html`, `refresh`));
  gulp.watch(`source/js/**/*.js`, gulp.series(`scripts`, `refresh`));
});

gulp.task(`refresh`, (done) => {
  server.reload();
  done();
});

gulp.task(`images`, () => {
  return gulp.src(`source/img/**/*.{png,jpg,svg}`)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))

    .pipe(gulp.dest(`source/img`));

});

gulp.task(`webp`, () => {
  return gulp.src(`source/img/**/*.{png,jpg}`)
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(`source/img`));
});

gulp.task(`sprite`, () => {
  return gulp.src(`source/img/icon-*.svg`)
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename(`sprite.svg`))
    .pipe(gulp.dest(`build/img/`));
});

gulp.task(`html`, () => {
  return gulp.src(`source/*.html`)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(`build`));
});

gulp.task(`copy`, () => {
  return gulp.src([
    `source/fonts/**/*.{woff,woff2,ttf}`,
    `source/img/**`,
    `source/js/**/*.js`,
    `source/*.ico`
    ], {
      base: `source`
    })
  .pipe(gulp.dest(`build`));
});

gulp.task(`clean`, () => {
  return del(`build`);
});

gulp.task(`build`, gulp.series(`clean`, `copy`, `css-min`, `css`, `sprite`, `html`, `scripts`, `js-libs`));
gulp.task(`start`, gulp.series(`build`, `server`));
