FROM alpine:3.17 as targetarch

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETARCH

ARG BINARYEN_VERSION="version_110"

RUN echo "Running on $BUILDPLATFORM, building for $TARGETPLATFORM"

# AMD64
FROM targetarch as builder-amd64
ARG ARCH="x86_64"

# ARM64
FROM targetarch as builder-arm64
ARG ARCH="aarch64"

FROM builder-${TARGETARCH} as builder

# Download binaryen sources
ADD https://github.com/WebAssembly/binaryen/archive/refs/tags/$BINARYEN_VERSION.tar.gz /tmp/binaryen.tar.gz

# Extract and compile wasm-opt
# Adapted from https://github.com/WebAssembly/binaryen/blob/main/.github/workflows/build_release.yml
RUN apk update && apk add build-base cmake git python3 clang ninja
RUN tar -xf /tmp/binaryen.tar.gz
RUN cd binaryen-version_*/ \
  && git clone --depth 1 https://github.com/google/googletest.git ./third_party/googletest \
  && cmake . -G Ninja -DCMAKE_CXX_FLAGS="-static" -DCMAKE_C_FLAGS="-static" -DCMAKE_BUILD_TYPE=Release -DBUILD_STATIC_LIB=ON \
  && ninja wasm-opt

# Run tests
RUN cd binaryen-version_*/ && ninja wasm-as wasm-dis
RUN cd binaryen-version_*/ && python3 check.py wasm-opt

# Install wasm-opt
RUN strip binaryen-version_*/bin/wasm-opt
RUN mv binaryen-version_*/bin/wasm-opt /usr/local/bin

# Check wasm-opt version
RUN wasm-opt --version

ADD optimize.sh /usr/local/bin/optimize.sh
RUN chmod +x /usr/local/bin/optimize.sh

WORKDIR /code

COPY /target /code/target

VOLUME /artifacts /code/artifacts

ENTRYPOINT ["optimize.sh"]
# Default argument when none is provided
CMD ["."]

